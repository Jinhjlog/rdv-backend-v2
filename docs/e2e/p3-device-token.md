# 디바이스 토큰 E2E 테스트 시나리오

> 우선순위: P3
> 관련 컨트롤러: `src/module/device-token/presentation/controllers/device-token.controller.ts`

## 개요

FCM 디바이스 토큰 등록 + 삭제의 핵심 흐름을 검증합니다. 테스트 환경에서는 MockTokenValidationAdapter가 토큰을 항상 유효한 것으로 처리합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                     |
| ----------- | ---------------------------------------- |
| 인증 토큰   | register API로 발급된 accessToken        |
| 선행 데이터 | 디폴트 캐릭터 (isDefault=true) 시드 필요 |

## 테스트 시나리오

### TC-DTK-001: 디바이스 토큰 등록 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v1/device-tokens`

**Given**

- 인증된 사용자 (디바이스 토큰 미등록 상태)

**When**

- `POST /api/v1/device-tokens`
- Header: `Authorization: Bearer {accessToken}`
- Body: `{ "token": "fcm-test-token-001", "platform": "ANDROID" }`

**Then**

- 응답 상태: `204 No Content`
- DB 부수효과: device_tokens 테이블에 해당 사용자의 토큰이 저장됨

---

### TC-DTK-002: 동일 사용자 토큰 재등록 시 업데이트

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v1/device-tokens`

**Given**

- 인증된 사용자가 이미 디바이스 토큰을 등록한 상태

**When**

- `POST /api/v1/device-tokens`
- Header: `Authorization: Bearer {accessToken}`
- Body: `{ "token": "fcm-new-token-002", "platform": "IOS" }`

**Then**

- 응답 상태: `204 No Content`
- DB 부수효과: 기존 토큰이 새 토큰으로 업데이트됨 (1:1 관계 유지)

---

### TC-DTK-003: 디바이스 토큰 삭제 성공

> **분류**: Happy Path
> **대상 API**: `DELETE /api/v1/device-tokens`

**Given**

- 인증된 사용자가 디바이스 토큰을 등록한 상태

**When**

- `DELETE /api/v1/device-tokens`
- Header: `Authorization: Bearer {accessToken}`
- Body: `{ "token": "fcm-test-token-001" }`

**Then**

- 응답 상태: `204 No Content`

---

## 시나리오 요약

| TC ID      | 시나리오                            | 분류               | 상태       |
| ---------- | ----------------------------------- | ------------------ | ---------- |
| TC-DTK-001 | 디바이스 토큰 등록 성공             | Happy Path         | [ ] 미작성 |
| TC-DTK-002 | 동일 사용자 토큰 재등록 시 업데이트 | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-DTK-003 | 디바이스 토큰 삭제 성공             | Happy Path         | [ ] 미작성 |
