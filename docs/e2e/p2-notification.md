# 알림 E2E 테스트 시나리오

> 우선순위: P2
> 관련 컨트롤러: `src/module/notification/presentation/controllers/notification.controller.ts`, `admin-notification.controller.ts`

## 개요

알림 목록 조회 + 미읽음 개수 + 읽음 처리 + 구독 설정 관리의 핵심 흐름을 검증합니다. 알림은 도메인 이벤트 핸들러에 의해 자동 생성되므로, 테스트에서는 DB 직접 시드로 알림을 생성합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                               |
| ----------- | ---------------------------------- |
| 인증 토큰   | register API로 발급된 accessToken  |
| 선행 데이터 | 디폴트 캐릭터 시드 + 회원가입 완료 |

## 테스트 시나리오

### TC-NTF-001: 알림 목록 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/notifications`

**Given**

- 인증된 사용자에게 알림이 1개 이상 존재 (DB 직접 시드)

**When**

- `GET /api/v1/notifications`
- Header: `Authorization: Bearer {accessToken}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 data에 items 배열 포함 (1개 이상)
- 각 item에 id, type, title, subtitle, isRead, createdAt 포함

---

### TC-NTF-002: 미읽음 알림 개수 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/notifications/unread-count`

**Given**

- 인증된 사용자에게 미읽음 알림이 존재 (DB 직접 시드)

**When**

- `GET /api/v1/notifications/unread-count`
- Header: `Authorization: Bearer {accessToken}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 data.count가 0보다 큼

---

### TC-NTF-003: 개별 알림 읽음 처리 성공

> **분류**: Happy Path
> **대상 API**: `PATCH /api/v1/notifications/:notificationId/read`

**Given**

- 인증된 사용자에게 미읽음 알림이 존재 (DB 직접 시드)

**When**

- `PATCH /api/v1/notifications/{notificationId}/read`
- Header: `Authorization: Bearer {accessToken}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 data.isRead가 true
- 응답 본문의 data.readAt이 존재

---

### TC-NTF-004: 타인의 알림 읽음 처리 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `PATCH /api/v1/notifications/:notificationId/read`

**Given**

- 다른 사용자 소유의 알림

**When**

- `PATCH /api/v1/notifications/{다른사용자 알림 ID}/read`
- Header: `Authorization: Bearer {본인 accessToken}`

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `NOTIFICATION_ACCESS_DENIED`

---

### TC-NTF-005: 알림 구독 설정 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/notifications/subscriptions`

**Given**

- 회원가입 완료된 사용자 (회원가입 시 기본 구독 설정 자동 생성)

**When**

- `GET /api/v1/notifications/subscriptions`
- Header: `Authorization: Bearer {accessToken}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 data에 subscriptions 배열 포함
- 각 item에 type, isSubscribed 포함

---

## 시나리오 요약

| TC ID      | 시나리오                    | 분류               | 상태       |
| ---------- | --------------------------- | ------------------ | ---------- |
| TC-NTF-001 | 알림 목록 조회 성공         | Happy Path         | [ ] 미작성 |
| TC-NTF-002 | 미읽음 알림 개수 조회 성공  | Happy Path         | [ ] 미작성 |
| TC-NTF-003 | 개별 알림 읽음 처리 성공    | Happy Path         | [ ] 미작성 |
| TC-NTF-004 | 타인의 알림 읽음 처리 → 400 | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-NTF-005 | 알림 구독 설정 조회 성공    | Happy Path         | [ ] 미작성 |
