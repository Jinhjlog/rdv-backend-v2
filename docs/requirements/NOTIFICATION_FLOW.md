# 알림(Notification) 시스템 설계 문서

> **최종 수정일**: 2026-02-19
> **참고 문서**: `NOTIFICATION_API_SPEC.md` (프론트엔드 기획서)

---

## 1. 개요

사용자에게 앱 내 활동(모임, 캐릭터, 출석, 시스템 공지)에 대한 알림을 제공하는 시스템.

### 사용 위치

| 위치 | 설명 |
|------|------|
| 홈탭 알림 미리보기 | 미읽음 알림 최대 4건을 카드 형태로 표시 |
| 알림 바텀시트 | 벨 아이콘 탭 시 전체 알림 목록을 바텀시트로 표시 |

### 핵심 기능

- 알림 목록 조회 (타입별 필터링, 커서 기반 페이지네이션)
- 개별 / 전체 읽음 처리
- 미읽음 알림 개수 조회

### 설계 방식

**Fan-out on Write** — 모든 알림(개인 + 공용)을 수신 대상 유저별로 각각 row 생성.

- 시스템 공지도 대상 유저마다 개별 row insert (이벤트 핸들러에서 batch insert)
- 단일 테이블로 쿼리 단순화 (`WHERE user_id = ?`)
- 읽음 상태를 알림 row 자체에서 관리

---

## 2. 데이터 모델

### 2-1. Prisma 스키마

```prisma
model notifications {
  id             String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id        String             @db.Uuid
  type           notification_type
  title          String             @db.VarChar(100)
  subtitle       String             @db.VarChar(200)
  is_read        Boolean            @default(false)
  reference_id   String?            @db.Uuid
  reference_type String?            @db.VarChar(50)
  read_at        DateTime?          @db.Timestamptz(6)
  created_at     DateTime           @default(now()) @db.Timestamptz(6)

  user public_users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, created_at(sort: Desc)], map: "idx_notifications_user_created")
  @@index([user_id, is_read, created_at(sort: Desc)], map: "idx_notifications_user_unread")
  @@index([user_id, type, created_at(sort: Desc)], map: "idx_notifications_user_type")
  @@schema("public")
}

enum notification_type {
  MEETING
  CHARACTER
  ATTENDANCE
  SYSTEM

  @@schema("public")
}
```

### 2-2. 필드 설명

| 컬럼명 | 타입 | 제약조건 | 설명 | 기본값 |
|--------|------|----------|------|--------|
| `id` | UUID | PK | 알림 고유 식별자 | `gen_random_uuid()` |
| `user_id` | UUID | FK, NOT NULL | 수신 대상 사용자 ID | - |
| `type` | ENUM | NOT NULL | 알림 유형 | - |
| `title` | VARCHAR(100) | NOT NULL | 알림 제목 | - |
| `subtitle` | VARCHAR(200) | NOT NULL | 알림 부제/설명 | - |
| `is_read` | BOOLEAN | NOT NULL | 읽음 여부 | `false` |
| `reference_id` | UUID | NULLABLE | 연관 엔티티 ID (딥링크용) | `null` |
| `reference_type` | VARCHAR(50) | NULLABLE | 연관 엔티티 종류 | `null` |
| `read_at` | TIMESTAMPTZ | NULLABLE | 읽음 처리 시각 | `null` |
| `created_at` | TIMESTAMPTZ | NOT NULL | 생성 시각 | `now()` |

### 2-3. 인덱스 전략

| 인덱스명 | 컬럼 | 용도 |
|----------|------|------|
| `idx_notifications_user_created` | `(user_id, created_at DESC)` | 전체 알림 목록 조회 |
| `idx_notifications_user_unread` | `(user_id, is_read, created_at DESC)` | 미읽음 개수 카운트, 전체 읽음 처리 |
| `idx_notifications_user_type` | `(user_id, type, created_at DESC)` | 타입별 필터 조회 |

### 2-4. 삭제 정책

- **사용자 삭제 시**: `CASCADE` — 해당 유저의 모든 알림 함께 삭제
- **알림 보관 기간**: 30일 (배치 잡으로 `created_at < now() - 30d` 정리, 향후 구현)

### 2-5. 관계

```
public_users 1 ── N notifications
```

---

## 3. 도메인 모델

### 3-1. NotificationType (Value Object / Enum)

| 도메인 값 | DB 값 | API 응답 값 | 설명 |
|-----------|-------|-------------|------|
| `MEETING` | `MEETING` | `meeting` | 모임 관련 알림 |
| `CHARACTER` | `CHARACTER` | `character` | 캐릭터 관련 알림 |
| `ATTENDANCE` | `ATTENDANCE` | `attendance` | 출석 관련 알림 |
| `SYSTEM` | `SYSTEM` | `system` | 시스템/공지 알림 |

> DB Enum은 UPPER_CASE (프로젝트 컨벤션), API 응답은 lowercase (프론트 스펙). Transformer에서 변환.

### 3-2. Notification Aggregate

```typescript
interface NotificationProps {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  readAt?: Date;
  createdAt: Date;
}
```

**도메인 메서드**:

| 메서드 | 설명 |
|--------|------|
| `static create(props)` | 팩토리 메서드. `isRead=false`, `createdAt=now()` 기본값 |
| `markAsRead()` | 읽음 처리. 이미 읽음이면 무시 (멱등성) |

### 3-3. Repository 인터페이스

```typescript
abstract class NotificationRepository {
  abstract save(notification: Notification): Promise<void>;
  abstract saveBatch(notifications: Notification[]): Promise<void>;
  abstract findById(id: string): Promise<Notification | undefined>;
  abstract findByUserId(query: NotificationListQuery): Promise<NotificationPage>;
  abstract countUnreadByUserId(userId: string): Promise<number>;
  abstract markAllAsReadByUserId(userId: string, type?: NotificationType): Promise<number>;
}
```

### 3-4. Query/Page 타입

```typescript
// 조회 쿼리
interface NotificationListQuery {
  userId: string;
  type?: NotificationType;
  cursor?: string;
  limit: number;
}

// 페이지네이션 결과
interface NotificationPage {
  notifications: Notification[];
  nextCursor: string | null;
  hasNext: boolean;
}
```

---

## 4. API 엔드포인트

> 프론트엔드 기획서(`NOTIFICATION_API_SPEC.md`) 기준. 응답 필드명 정확히 일치시켜야 함.

### 4-1. 알림 목록 조회

```
GET /api/v1/notifications
```

**인증**: Bearer Token (필수)

**Query Parameters**:

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `type` | string | X | - | 알림 유형 필터 (`meeting` / `character` / `attendance` / `system`) |
| `cursor` | string | X | - | 페이지네이션 커서 (이전 응답의 `nextCursor`) |
| `limit` | number | X | `20` | 조회 개수 (최대 50) |

**Response (200)**:

```json
{
  "data": {
    "notifications": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "type": "meeting",
        "title": "오늘 정기 모임이 있어요!",
        "subtitle": "오후 7:00 · 강남역 2번 출구",
        "timeAgo": "1h",
        "isRead": false,
        "referenceId": "meeting-uuid-123",
        "referenceType": "meeting",
        "createdAt": "2026-02-18T13:00:00.000Z",
        "readAt": null
      }
    ],
    "nextCursor": "550e8400-e29b-41d4-a716-446655440002",
    "hasNext": true
  }
}
```

**`timeAgo` 계산 규칙** (서버에서 계산):

| 조건 | 형식 | 예시 |
|------|------|------|
| 1시간 미만 | `Nm` | `5m`, `30m` |
| 24시간 미만 | `Nh` | `1h`, `12h` |
| 7일 미만 | `Nd` | `1d`, `6d` |
| 7일 이상 | `M/D` | `2/11`, `1/30` |

**커서 기반 페이지네이션 로직**:

```sql
-- 첫 페이지
SELECT * FROM notifications
WHERE user_id = :userId
ORDER BY created_at DESC
LIMIT :limit + 1

-- 다음 페이지 (cursor = 마지막 알림의 id)
SELECT * FROM notifications
WHERE user_id = :userId
  AND created_at < (SELECT created_at FROM notifications WHERE id = :cursor)
ORDER BY created_at DESC
LIMIT :limit + 1
```

- `limit + 1`개를 조회하여 `hasNext` 판단
- 다음 페이지가 있으면 마지막 항목의 `id`를 `nextCursor`로 반환

### 4-2. 미읽음 알림 개수 조회

```
GET /api/v1/notifications/unread-count
```

**인증**: Bearer Token (필수)

**Response (200)**:

```json
{
  "data": {
    "count": 4
  }
}
```

### 4-3. 전체 읽음 처리

```
PATCH /api/v1/notifications/read-all
```

**인증**: Bearer Token (필수)

**Request Body**:

```json
{
  "type": "meeting"  // (선택) 특정 타입만 읽음 처리. 생략 시 전체
}
```

**Response (200)**:

```json
{
  "data": {
    "updatedCount": 4
  }
}
```

**처리 로직**:

1. 해당 유저의 `is_read = false` 알림을 대상으로
2. `type` 파라미터가 있으면 해당 타입만 필터
3. 일괄 `is_read = true`, `read_at = now()` 업데이트
4. 업데이트된 건수 반환

### 4-4. 개별 알림 읽음 처리

```
PATCH /api/v1/notifications/:id/read
```

**인증**: Bearer Token (필수)

**Response (200)**:

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "isRead": true,
    "readAt": "2026-02-18T14:30:00.000Z"
  }
}
```

**처리 로직**:

1. 알림 존재 여부 확인 → 없으면 `404`
2. 소유자 검증 (본인 알림인지) → 아니면 `403`
3. 이미 읽음 상태면 현재 상태 그대로 반환 (멱등성)
4. `is_read = true`, `read_at = now()` 업데이트

---

## 5. 에러 코드

| HTTP Status | Error Code | 메시지 | 설명 |
|-------------|-----------|--------|------|
| 400 | `NOTIFICATION_INVALID_TYPE` | 유효하지 않은 알림 타입입니다 | `type` 값이 enum에 없음 |
| 400 | `NOTIFICATION_INVALID_CURSOR` | 유효하지 않은 커서입니다 | `cursor`가 존재하지 않는 알림 ID |
| 400 | `NOTIFICATION_INVALID_LIMIT` | limit는 1~50 사이여야 합니다 | `limit` 범위 초과 |
| 403 | `NOTIFICATION_ACCESS_DENIED` | 접근 권한이 없습니다 | 다른 유저의 알림 접근 |
| 404 | `NOTIFICATION_NOT_FOUND` | 알림을 찾을 수 없습니다 | 존재하지 않는 알림 ID |

---

## 6. 알림 생성 (서버 내부)

알림은 클라이언트가 직접 생성하지 않으며, **도메인 이벤트 핸들러**에서 자동 생성된다.

### 6-1. 알림 생성 트리거

| 이벤트 | type | title | subtitle | referenceType | 대상 |
|--------|------|-------|----------|---------------|------|
| 새 캐릭터 획득 | `CHARACTER` | 새로운 친구 '{캐릭터명}'가 도착했어요! | 캐릭터 컬렉션에서 확인하세요 | `character` | 해당 유저 1명 |
| 캐릭터 레벨업 | `CHARACTER` | 캐릭터 '{캐릭터명}'가 레벨업! | Lv.{이전} → Lv.{이후} | `character` | 해당 유저 1명 |
| 출석 체크 리마인더 | `ATTENDANCE` | 출석 체크하고 보상 받으세요 | 연속 {N}일째 출석 중! 화이팅 | - | 해당 유저 1명 |
| 출석 보상 지급 | `ATTENDANCE` | 출석 보상이 도착했어요! | {보상 내용} | - | 해당 유저 1명 |
| 정기 모임 리마인더 | `MEETING` | 오늘 정기 모임이 있어요! | 오후 7:00 · {장소} | `event` | 모임 멤버 전원 |
| 모임 일정 변경 | `MEETING` | 모임 일정이 변경되었어요 | {변경 내용 요약} | `event` | 모임 멤버 전원 |
| 앱 공지사항 | `SYSTEM` | {공지 제목} | {공지 요약} | - | 전체 유저 |
| 시스템 점검 안내 | `SYSTEM` | 시스템 점검 안내 | {날짜} {시간} 점검 예정 | - | 전체 유저 |

### 6-2. 이벤트 핸들러 구조

```
[기존 도메인 이벤트] → [Notification 이벤트 핸들러] → [NotificationRepository.save/saveBatch]
```

**개인 알림** (캐릭터, 출석):
- 기존 도메인 이벤트(예: `CharacterUnlockedEvent`)를 구독
- 알림 1건 생성 → `save()`

**모임 알림**:
- 모임 도메인 이벤트 구독
- 모임 멤버 목록 조회 → 멤버 수만큼 알림 생성 → `saveBatch()`

**시스템 공지**:
- 관리자 API 또는 내부 서비스에서 트리거
- 전체 유저 목록 조회 → `saveBatch()`
- 유저 수가 많아지면 큐(BullMQ) 기반 비동기 처리 고려

---

## 7. 모듈 구조

```
src/module/notification/
├── domain/
│   ├── models/
│   │   └── notification.ts              # Notification Aggregate
│   └── repositories/
│       └── notification.repository.ts   # abstract class
├── application/
│   ├── dtos/
│   │   ├── get-notification-list.dto.ts
│   │   ├── read-notification.dto.ts
│   │   └── read-all-notifications.dto.ts
│   ├── usecases/
│   │   ├── get-notification-list.usecase.ts
│   │   ├── get-unread-count.usecase.ts
│   │   ├── read-notification.usecase.ts
│   │   └── read-all-notifications.usecase.ts
│   └── handlers/
│       ├── character-unlocked-notification.handler.ts
│       └── ...
├── infra/
│   ├── mappers/
│   │   └── notification.mapper.ts       # Prisma <-> Domain 변환
│   └── repositories/
│       └── notification.repository.impl.ts
├── presentation/
│   ├── controllers/
│   │   └── notification.controller.ts
│   ├── dtos/
│   │   ├── request/
│   │   │   ├── get-notification-list.request.dto.ts
│   │   │   └── read-all-notifications.request.dto.ts
│   │   └── response/
│   │       ├── notification-list.response.dto.ts
│   │       ├── unread-count.response.dto.ts
│   │       └── read-notification.response.dto.ts
│   └── transformers/
│       └── notification.transformer.ts  # Domain -> API 응답 변환 (type lowercase, timeAgo 계산)
├── notification-core.module.ts
└── notification.module.ts
```

---

## 8. 프론트엔드 응답 필드 매핑

프론트 클라이언트의 `fromJson`이 이미 구현되어 있으므로 아래 필드명을 정확히 맞춰야 한다.

```
서버 응답 필드         →  프론트 fromJson 키
─────────────────────────────────────────
id                    →  "id"         (string, 필수)
type                  →  "type"       (string: "meeting" | "character" | "attendance" | "system")
title                 →  "title"      (string)
subtitle              →  "subtitle"   (string)
timeAgo               →  "timeAgo"    (string, 서버 계산 권장 — 없으면 빈 문자열 폴백)
isRead                →  "isRead"     (boolean)
referenceId           →  "referenceId"    (string?, 현재 미사용 — 딥링크 대비 반환)
referenceType         →  "referenceType"  (string?, 현재 미사용 — 딥링크 대비 반환)
createdAt             →  "createdAt"  (ISO 8601 string)
readAt                →  "readAt"     (ISO 8601 string?)
```

> `type` 필드: DB에는 `MEETING`(대문자)으로 저장, API 응답에서는 `meeting`(소문자)으로 변환하여 반환.

---

## 9. 향후 확장 고려사항

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| 푸시 알림 (FCM) 연동 | 알림 생성 시 Firebase 푸시 함께 전송 | 높음 |
| 알림 개별 삭제 | `DELETE /api/v1/notifications/:id` | 중간 |
| 알림 설정 | 유저별 알림 수신 on/off (타입별) | 중간 |
| 딥링크 | 알림 탭 시 `referenceId` + `referenceType` 기반 화면 이동 | 중간 |
| 30일 자동 삭제 배치 | `created_at < now() - 30d` 정리 크론잡 | 낮음 |
| 실시간 알림 (WebSocket/SSE) | 알림 생성 시 실시간 수신 | 낮음 |
