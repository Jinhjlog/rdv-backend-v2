# 앱 버전 E2E 테스트 시나리오

> 우선순위: P3
> 관련 컨트롤러: `src/module/app-version/presentation/controllers/app-version.controller.ts`, `admin-app-version.controller.ts`

## 개요

플랫폼별 앱 버전 정보 조회(공개) + 관리자 버전 수정의 핵심 흐름을 검증합니다.

## 사전 조건 (Preconditions)

| 항목        | 설명                                             |
| ----------- | ------------------------------------------------ |
| 인증 토큰   | 공개 API는 불필요, 관리자 API는 `x-api-key` 헤더 |
| 선행 데이터 | 없음 (관리자 API로 직접 생성 가능)               |

## 테스트 시나리오

### TC-VER-001: 등록된 플랫폼의 앱 버전 조회 성공

> **분류**: Happy Path
> **대상 API**: `GET /api/v1/app-versions?platform=`

**Given**

- ANDROID 플랫폼의 버전 정보가 등록되어 있음 (관리자 API로 사전 생성)

**When**

- `GET /api/v1/app-versions?platform=ANDROID`

**Then**

- 응답 상태: `200 OK`
- 응답 본문에 latestVersion, minRequiredVersion, storeUrl 포함

---

### TC-VER-002: 미등록 플랫폼 조회 시 404

> **분류**: 핵심 비즈니스 규칙
> **대상 API**: `GET /api/v1/app-versions?platform=`

**Given**

- IOS 플랫폼의 버전 정보가 등록되어 있지 않음

**When**

- `GET /api/v1/app-versions?platform=IOS`

**Then**

- 응답 상태: `404 Not Found`
- 에러 코드: `APP_VERSION_NOT_FOUND`

---

### TC-VER-003: 관리자 앱 버전 등록/수정 성공

> **분류**: Happy Path
> **대상 API**: `PUT /api/v1/admin/app-versions`

**Given**

- 유효한 관리자 API 키

**When**

- `PUT /api/v1/admin/app-versions`
- Header: `x-api-key: {ADMIN_API_KEY}`
- Body: `{ "platform": "ANDROID", "latestVersion": "2.0.0", "minRequiredVersion": "1.5.0", "storeUrl": "https://play.google.com/store/apps/details?id=com.eodigae.app" }`

**Then**

- 응답 상태: `204 No Content`

---

### TC-VER-004: API Key 없이 관리자 API 호출 시 401

> **분류**: 인증 검증
> **대상 API**: `PUT /api/v1/admin/app-versions`

**Given**

- `x-api-key` 헤더가 없음

**When**

- `PUT /api/v1/admin/app-versions`
- Body: `{ "platform": "ANDROID", "latestVersion": "2.0.0", "minRequiredVersion": "1.5.0", "storeUrl": "https://play.google.com/store/apps/details?id=com.eodigae.app" }`

**Then**

- 응답 상태: `401 Unauthorized`
- 에러 코드: `INVALID_API_KEY`

---

## 시나리오 요약

| TC ID      | 시나리오                           | 분류               | 상태       |
| ---------- | ---------------------------------- | ------------------ | ---------- |
| TC-VER-001 | 등록된 플랫폼 앱 버전 조회 성공    | Happy Path         | [ ] 미작성 |
| TC-VER-002 | 미등록 플랫폼 조회 → 404           | 핵심 비즈니스 규칙 | [ ] 미작성 |
| TC-VER-003 | 관리자 앱 버전 등록/수정 성공      | Happy Path         | [ ] 미작성 |
| TC-VER-004 | API Key 없이 관리자 API 호출 → 401 | 인증 검증          | [ ] 미작성 |
