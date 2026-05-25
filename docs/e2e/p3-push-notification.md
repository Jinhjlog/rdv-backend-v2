# 푸시 알림 E2E 테스트 시나리오

> 우선순위: P3
> 관련 컨트롤러: `src/module/push-notification/presentation/controllers/push-notification.controller.ts`

## 개요

테스트 푸시 알림 발송 API의 핵심 흐름을 검증합니다. 테스트 환경에서는 MockNotificationSenderAdapter가 실제 FCM 발송 없이 동작합니다.

## 사전 조건 (Preconditions)

| 항목          | 설명                                               |
| ------------- | -------------------------------------------------- |
| 관리자 API 키 | `x-api-key` 헤더에 ADMIN_API_KEY 필요              |
| 선행 데이터   | 디폴트 캐릭터 시드 + 회원가입 + 디바이스 토큰 등록 |

## 테스트 시나리오

### TC-PUSH-001: 테스트 푸시 발송 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/push-notifications/test`

**Given**

- 유효한 관리자 API 키
- 대상 사용자가 디바이스 토큰을 등록한 상태 (DB 직접 시드)

**When**

- `POST /api/v1/push-notifications/test`
- Header: `x-api-key: {ADMIN_API_KEY}`
- Body: `{ "userId": "{사용자 ID}", "title": "테스트 알림", "body": "테스트 푸시입니다" }`

**Then**

- 응답 상태: `201 Created`
- 응답 본문에 success, message 포함

---

### TC-PUSH-002: API Key 없이 테스트 푸시 발송 시 401

> **분류**: 인증 검증
> **대상 API**: `POST /api/v1/push-notifications/test`

**Given**

- `x-api-key` 헤더 없음

**When**

- `POST /api/v1/push-notifications/test`
- Body: `{ "userId": "some-user-id", "title": "테스트", "body": "테스트" }`

**Then**

- 응답 상태: `401 Unauthorized`
- 에러 코드: `INVALID_API_KEY`

---

## 시나리오 요약

| TC ID       | 시나리오                 | 분류       | 상태       |
| ----------- | ------------------------ | ---------- | ---------- |
| TC-PUSH-001 | 테스트 푸시 발송 성공    | Happy Path | [ ] 미작성 |
| TC-PUSH-002 | API Key 없이 발송 시 401 | 인증 검증  | [ ] 미작성 |
