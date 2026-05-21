# 푸시 알림 및 디바이스 토큰 (Push Notification & Device Token)

> 두 개의 독립 모듈로 구성: `src/module/device-token/` (토큰 관리) + `src/module/push-notification/` (푸시 발송)

## 1. 배경 및 문제 정의

FCM(Firebase Cloud Messaging) 기반 푸시 알림 발송 시스템. 디바이스 토큰 등록/삭제(`device-token` 모듈)와 도메인 이벤트를 구독하여 자동으로 푸시를 발송하는(`push-notification` 모듈) 두 개의 독립 모듈로 구성된다.

디바이스 토큰은 사용자당 1개만 유지(1:1 관계)하며, 등록 시 FCM dry-run으로 토큰 유효성을 사전 검증한다. 동일 FCM 토큰이 다른 사용자에게 등록되어 있으면 기기 소유권 이전으로 처리한다. 푸시 발송은 도메인 이벤트 핸들러에서 자동 트리거되며, 알림 구독 설정(notification_subscriptions)을 확인하여 수신 거부한 사용자에게는 발송하지 않는다.

### 핵심 책임

- 디바이스 토큰 등록/삭제 (FCM dry-run 검증)
- 도메인 이벤트 기반 자동 푸시 발송
- 알림 구독 설정 기반 발송 필터링
- 실패 토큰 자동 정리

### 이 BC가 직접 만들지 않는 것

- 인앱 알림 저장 → Notification BC
- 도메인 이벤트 발행 → 각 BC (Group, Event, Character 등)
- 알림 구독 설정 관리 → Notification BC

## 2. 사용자 시나리오

### 시나리오 1: 디바이스 토큰 등록

1. 앱 시작 시 FCM 토큰 획득
2. POST /api/v1/device-tokens 호출
3. 백엔드 처리:
   - FCM dry-run으로 토큰 유효성 검증
   - 동일 FCM 토큰이 다른 사용자에게 있으면 삭제 (기기 소유권 이전)
   - 사용자의 기존 토큰 삭제 후 새 토큰 등록
4. 응답: 204 No Content

### 시나리오 2: 도메인 이벤트 기반 푸시 발송

1. 일정 생성 시 EventCreatedEvent 발행 (Event BC)
2. EventCreatedPushHandler가 이벤트 구독
3. 대상 사용자의 알림 구독 설정 확인 (MEETING 타입 구독 여부)
4. 구독 중인 사용자의 디바이스 토큰 조회
5. FCM으로 푸시 발송
6. 실패한 토큰은 자동 정리

### 시나리오 3: 로그아웃 시 토큰 삭제

1. 사용자가 로그아웃
2. DELETE /api/v1/device-tokens 호출
3. 해당 토큰 삭제 → 푸시 알림 수신 중단

## 3. 기능 요구사항

### 디바이스 토큰

- [x] POST /api/v1/device-tokens (인증 필수)
- [x] 입력: token, platform (IOS/ANDROID), deviceInfo? (선택)
- [x] FCM dry-run으로 토큰 유효성 검증
- [x] 동일 FCM 토큰 다른 사용자 소유 시 삭제 (기기 소유권 이전)
- [x] 사용자당 1개 토큰 유지 (기존 토큰 교체)

- [x] DELETE /api/v1/device-tokens (인증 필수)
- [x] 입력: token
- [x] 존재하지 않는 토큰 삭제 시 에러 없음 (멱등성)

### 푸시 발송 (이벤트 핸들러)

- [x] EventCreatedPushHandler — 일정 생성 시 모임 멤버에게 알림
- [x] EventStartedPushHandler — 일정 진행중 전환 시 참여자에게 알림
- [x] EventEndedPushHandler — 일정 종료 시 참여자에게 결과 알림
- [x] EventCancelledPushHandler — 일정 취소 시 참여자에게 알림
- [x] MemberKickedPushHandler — 멤버 강퇴 시 강퇴된 사용자에게 알림
- [x] CharacterUnlockedPushHandler — 캐릭터 언락 시 해당 사용자에게 알림
- [x] SystemNotificationPushHandler — 시스템 공지 브로드캐스트 시 전체 발송

### 발송 인프라

- [x] PushDispatchService — FCM 발송 + 실패 토큰 자동 정리
- [x] SubscriptionFilterRepository — 알림 구독 설정 기반 발송 대상 필터링
- [x] HandleFailedTokensUseCase — 발송 실패 토큰 일괄 삭제

### 테스트 (관리자)

- [x] POST /api/v1/push-notifications/test (테스트 API 키)
- [x] 입력: testKey, userId, title, body, data?
- [x] 특정 사용자에게 테스트 푸시 발송

## 4. 범위

### 미포함 (후속)

- 푸시 발송 이력 저장/조회
- 예약 푸시 (특정 시간에 발송)
- 푸시 템플릿 관리
- 발송 통계 대시보드

### 명시적 제외

- 인앱 알림 저장 → Notification BC
- 알림 구독 설정 CRUD → Notification BC

## 5. 전제 조건 및 제약사항

- 사용자당 디바이스 토큰 1개 (1:1 관계) — 멀티 디바이스 미지원
- FCM dry-run 검증 실패 시 토큰 등록 무시 (에러 미발생)
- 알림 구독 off인 사용자에게는 푸시 미발송 (SubscriptionFilter)
- 발송 실패 토큰(InvalidRegistration, NotRegistered 등)은 자동 삭제
- 테스트 API 키는 하드코딩 상태 (보안 개선 필요)
