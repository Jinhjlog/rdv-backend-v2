# 사용자 인증 & 프로필 E2E 테스트 시나리오

> 우선순위: P0
> 관련 컨트롤러: `src/module/user/presentation/controllers/auth-v2.controller.ts`, `user.controller.ts`

## 개요

디바이스 ID 기반 계정 확인 → 회원가입/로그인 → JWT 토큰 발급 → 프로필 조회/캐릭터 변경까지의 인증 흐름을 검증합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                     |
| ----------- | ---------------------------------------- |
| 인증 토큰   | 회원가입/로그인 후 발급된 accessToken    |
| 선행 데이터 | 디폴트 캐릭터 (isDefault=true) 시드 필요 |

## 테스트 시나리오

### TC-AUTH-001: 미등록 deviceId로 계정 확인 시 exists=false

> **분류**: Happy Path
> **대상 API**: `GET /api/v2/auth/check-account?deviceId=`

**Given**

- DB에 해당 deviceId로 등록된 사용자가 없음

**When**

- `GET /api/v2/auth/check-account?deviceId=A1B2C3D4-E5F6-7890-ABCD-EF1234567890`

**Then**

- 응답 상태: `200 OK`
- 응답 본문: `{ "exists": false }`

---

### TC-AUTH-002: 등록된 deviceId로 계정 확인 시 exists=true

> **분류**: Happy Path
> **대상 API**: `GET /api/v2/auth/check-account?deviceId=`

**Given**

- 해당 deviceId로 등록된 사용자가 존재함

**When**

- `GET /api/v2/auth/check-account?deviceId={등록된 deviceId}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문: `{ "exists": true }`

---

### TC-AUTH-003: 신규 사용자 회원가입 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v2/auth/register`

**Given**

- 디폴트 캐릭터(isDefault=true)가 시드되어 있음
- 해당 deviceId로 등록된 사용자가 없음

**When**

- `POST /api/v2/auth/register`
- Body: `{ "deviceId": "new-device-001", "nickname": "테스터", "preferredThemeColor": "#FF5733" }`

**Then**

- 응답 상태: `201 Created`
- 응답 본문에 `accessToken` 포함
- 응답 본문에 사용자 정보 포함 (nickname, nameTag, characterCode, level=1, experience=0)

---

### TC-AUTH-004: 이미 등록된 deviceId로 회원가입 시 409

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v2/auth/register`

**Given**

- 해당 deviceId로 이미 등록된 사용자가 존재함

**When**

- `POST /api/v2/auth/register`
- Body: `{ "deviceId": "{등록된 deviceId}", "nickname": "중복자", "preferredThemeColor": "#000000" }`

**Then**

- 응답 상태: `409 Conflict`
- 에러 코드: `USER_ALREADY_EXISTS`

---

### TC-AUTH-005: 등록된 deviceId로 로그인 성공

> **분류**: Happy Path
> **대상 API**: `POST /api/v2/auth/login`

**Given**

- 해당 deviceId로 등록된 사용자가 존재함

**When**

- `POST /api/v2/auth/login`
- Body: `{ "deviceId": "{등록된 deviceId}" }`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 `accessToken` 포함
- 응답 본문에 사용자 정보 포함

---

### TC-AUTH-006: 미등록 deviceId로 로그인 시 401

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `POST /api/v2/auth/login`

**Given**

- 해당 deviceId로 등록된 사용자가 없음

**When**

- `POST /api/v2/auth/login`
- Body: `{ "deviceId": "unknown-device-999" }`

**Then**

- 응답 상태: `401 Unauthorized`
- 에러 코드: `AUTHENTICATION_FAILED`

---

### TC-AUTH-007: 인증된 사용자 프로필 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/users/me`

**Given**

- 회원가입 완료된 사용자의 accessToken이 있음

**When**

- `GET /api/v1/users/me`
- Header: `Authorization: Bearer {accessToken}`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 id, nickname, nameTag, preferredThemeColor, characterCode, level, experience 포함

---

### TC-AUTH-008: 보유 캐릭터로 변경 성공

> **분류**: Happy Path
> **대상 API**: `PATCH /api/v1/users/character`

**Given**

- 회원가입 완료된 사용자 (디폴트 캐릭터 보유)
- 추가 캐릭터를 user_characters에 시드

**When**

- `PATCH /api/v1/users/character`
- Header: `Authorization: Bearer {accessToken}`
- Body: `{ "characterCode": "{보유 캐릭터 코드}" }`

**Then**

- 응답 상태: `200 OK`
- 응답 본문의 characterCode가 변경된 값과 일치

---

### TC-AUTH-009: 미보유 캐릭터로 변경 시 400

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `PATCH /api/v1/users/character`

**Given**

- 회원가입 완료된 사용자
- 보유하지 않은 캐릭터 코드

**When**

- `PATCH /api/v1/users/character`
- Header: `Authorization: Bearer {accessToken}`
- Body: `{ "characterCode": "not-owned-character" }`

**Then**

- 응답 상태: `400 Bad Request`
- 에러 코드: `CHARACTER_NOT_OWNED`

---

## 시나리오 요약

| TC ID       | 시나리오                                   | 분류               | 상태       |
| ----------- | ------------------------------------------ | ------------------ | ---------- |
| TC-AUTH-001 | 미등록 deviceId로 계정 확인 → exists=false | Happy Path         | [ ] 미작성 |
| TC-AUTH-002 | 등록된 deviceId로 계정 확인 → exists=true  | Happy Path         | [ ] 미작성 |
| TC-AUTH-003 | 신규 사용자 회원가입 성공                  | Happy Path         | [ ] 미작성 |
| TC-AUTH-004 | 이미 등록된 deviceId로 회원가입 → 409      | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-AUTH-005 | 등록된 deviceId로 로그인 성공              | Happy Path         | [ ] 미작성 |
| TC-AUTH-006 | 미등록 deviceId로 로그인 → 401             | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-AUTH-007 | 인증된 사용자 프로필 조회 성공             | Happy Path         | [ ] 미작성 |
| TC-AUTH-008 | 보유 캐릭터로 변경 성공                    | Happy Path         | [ ] 미작성 |
| TC-AUTH-009 | 미보유 캐릭터로 변경 → 400                 | 핵심 비즈니스 규칙 | [ ] 미작성 |
