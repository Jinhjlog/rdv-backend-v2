# 알림 (Notification)

## 1. 배경 및 문제 정의

사용자에게 앱 내 활동(모임, 캐릭터, 출석, 시스템 공지)에 대한 알림을 제공하는 시스템. Fan-out on Write 방식으로 모든 알림을 수신 대상 유저별 개별 row로 생성하여 쿼리를 단순화(`WHERE user_id = ?`)했다.

알림 타입별 구독 on/off 설정을 지원하며, 개별/전체 읽음 처리는 멱등성을 보장한다. 관리자 API로 전체 유저 대상 시스템 공지 브로드캐스트가 가능하고, FCM 푸시 발송 여부를 선택할 수 있다.

### 핵심 책임

- 알림 목록 조회 (타입별 필터, 커서 기반 페이지네이션)
- 미읽음 알림 개수 조회
- 개별/전체 읽음 처리
- 알림 구독 설정 조회/변경
- 시스템 공지 브로드캐스트 (관리자)

### 이 BC가 직접 만들지 않는 것

- 알림 생성 트리거 — 도메인 이벤트 핸들러에서 자동 생성
- FCM 푸시 발송 → Push Notification BC
- 모임/일정/캐릭터 도메인 이벤트 발행 → 각 BC

## 2. 사용자 시나리오

### 시나리오 1: 알림 목록 조회 및 읽음 처리

1. 사용자가 벨 아이콘 탭
2. GET /api/v1/notifications 호출 (최신순, 기본 20개)
3. 타입 필터 적용 가능 (MEETING, CHARACTER, ATTENDANCE, SYSTEM)
4. 알림 탭 시 PATCH /api/v1/notifications/:id/read 호출 → 읽음 처리
5. "모두 읽음" 버튼 → PATCH /api/v1/notifications/read-all 호출

### 시나리오 2: 알림 구독 설정

1. 사용자가 알림 설정 화면 진입
2. GET /api/v1/notifications/subscriptions 호출 → 타입별 수신 여부 조회
3. 토글 변경 시 PATCH /api/v1/notifications/subscriptions/:type 호출
4. 동일 상태 재요청 시 에러 없이 현재 상태 반환 (멱등성)

### 시나리오 3: 시스템 공지 브로드캐스트 (관리자)

1. 관리자가 POST /api/v1/admin/notifications/broadcast 호출
2. 전체 유저에게 SYSTEM 타입 알림 개별 row 생성 (Fan-out on Write)
3. sendPush=true 시 FCM 푸시도 함께 발송

## 3. 기능 요구사항

### 알림 조회

- [x] GET /api/v1/notifications (인증 필수)
- [x] 타입 필터: MEETING, CHARACTER, ATTENDANCE, SYSTEM (선택)
- [x] 커서 기반 페이지네이션 (기본 20개, 최대 50개)
- [x] timeAgo 서버 계산 (1시간 미만: Nm, 24시간 미만: Nh, 7일 미만: Nd, 7일 이상: M/D)

- [x] GET /api/v1/notifications/unread-count (인증 필수)
- [x] 미읽음 알림 개수 반환

### 읽음 처리

- [x] PATCH /api/v1/notifications/:notificationId/read (인증 필수)
- [x] 검증: 본인 소유 알림 (`NOTIFICATION_ACCESS_DENIED`)
- [x] 검증: 알림 존재 (`NOTIFICATION_NOT_FOUND`)
- [x] 이미 읽음이면 현재 상태 그대로 반환 (멱등성)

- [x] PATCH /api/v1/notifications/read-all (인증 필수)
- [x] 입력: type? (선택 — 특정 타입만 읽음 처리)
- [x] 응답: updatedCount (처리된 알림 수)

### 구독 설정

- [x] GET /api/v1/notifications/subscriptions (인증 필수)
- [x] 타입별 수신 여부 전체 조회

- [x] PATCH /api/v1/notifications/subscriptions/:type (인증 필수)
- [x] 입력: isSubscribed (boolean)
- [x] 검증: 유효한 알림 타입 (`INVALID_NOTIFICATION_TYPE`)
- [x] 동일 상태 재요청 시 에러 없이 반환 (멱등성)

### 시스템 공지 (관리자)

- [x] POST /api/v1/admin/notifications/broadcast (관리자 API 키)
- [x] 입력: title, subtitle, sendPush? (기본 false), adminKey
- [x] 전체 유저에게 SYSTEM 타입 알림 Fan-out 생성
- [x] sendPush=true 시 FCM 푸시 함께 발송
- [x] 응답: notifiedUserCount

## 4. 범위

### 미포함 (후속)

- 알림 개별 삭제
- 딥링크 (referenceId + referenceType 기반 화면 이동)
- 30일 자동 삭제 배치잡
- 실시간 알림 (SSE/WebSocket)

### 명시적 제외

- 알림 생성 — 도메인 이벤트 핸들러에서 자동 처리
- FCM 푸시 발송 → Push Notification BC

## 5. 전제 조건 및 제약사항

- Fan-out on Write: 시스템 공지도 유저별 개별 row 생성 (대량 유저 시 큐 기반 비동기 처리 고려)
- 알림 타입은 DB UPPER_CASE, API 응답은 lowercase (Transformer에서 변환)
- 모든 응답은 `{ data: ... }` 형태로 래핑하여 반환 (다른 모듈과 패턴 다름)
- 사용자 삭제 시 CASCADE로 알림 + 구독 설정 삭제
- 관리자 API 키는 하드코딩 상태 (보안 개선 필요)
