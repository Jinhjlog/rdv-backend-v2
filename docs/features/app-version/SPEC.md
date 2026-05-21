# 앱 버전 (App Version)

## 1. 배경 및 문제 정의

플랫폼별(Android/iOS) 앱 최신 버전과 최소 필수 버전을 관리하여, 클라이언트가 앱 실행 시 강제 업데이트 또는 권장 업데이트를 안내하는 시스템.

버전 비교 로직은 클라이언트에서 수행하며, 서버는 버전 정보만 제공한다. 관리자 API로 버전 정보를 수정할 수 있고, 해당 플랫폼 정보가 없으면 자동 생성(UPSERT)된다.

### 핵심 책임

- 플랫폼별 앱 버전 정보 조회
- 플랫폼별 앱 버전 정보 수정 (관리자)

### 이 BC가 직접 만들지 않는 것

- 강제 업데이트 UI 표시 → 클라이언트
- 버전 비교 로직 → 클라이언트

## 2. 사용자 시나리오

### 시나리오 1: 앱 실행 시 버전 체크

1. 앱 실행 시 GET /api/v1/app-versions?platform=ANDROID 호출
2. 응답: latestVersion, minRequiredVersion, storeUrl
3. 클라이언트 판단:
   - 현재 버전 < minRequiredVersion → 강제 업데이트 (앱 사용 불가)
   - minRequiredVersion ≤ 현재 버전 < latestVersion → 선택적 업데이트 권장
   - 현재 버전 ≥ latestVersion → 업데이트 불필요

## 3. 기능 요구사항

### 버전 조회

- [x] GET /api/v1/app-versions?platform= (Public, 인증 불필요)
- [x] 입력: platform (ANDROID / IOS)
- [x] 검증: 유효한 플랫폼 (`PLATFORM_INVALID_VALUE`)
- [x] 검증: 버전 정보 존재 (`APP_VERSION_NOT_FOUND`)
- [x] 응답: latestVersion, minRequiredVersion, storeUrl

### 버전 수정 (관리자)

- [x] PUT /api/v1/admin/app-versions (관리자 API 키)
- [x] 입력: adminKey, platform, latestVersion, minRequiredVersion, storeUrl
- [x] 버전 형식: Semantic Versioning (예: 1.2.0)
- [x] 해당 플랫폼 정보 없으면 생성, 있으면 업데이트 (UPSERT)

## 4. 범위

### 미포함 (후속)

- 버전별 릴리즈 노트
- 강제 업데이트 유예 기간

### 명시적 제외

- 버전 비교/업데이트 UI → 클라이언트

## 5. 전제 조건 및 제약사항

- 인증 불필요 (Public API) — 앱 실행 최초 단계에서 호출
- 플랫폼당 1개 레코드 (platform UNIQUE 제약)
- 관리자 API 키는 하드코딩 상태 (보안 개선 필요)
