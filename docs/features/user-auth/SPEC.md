# 사용자 및 인증 (User & Auth)

## 1. 배경 및 문제 정의

디바이스 ID 기반으로 사용자를 식별하고, JWT 토큰을 발급하는 인증 시스템. 이메일/비밀번호 없이 디바이스 ID만으로 계정을 생성하고 로그인하여 앱 진입 마찰을 최소화했다.

V2 API에서 API Key + Platform Attestation(Play Integrity) 검증을 추가하여 보안을 강화했다. 회원가입 시 디폴트 캐릭터 자동 지급 + 네임태그 자동 할당이 이루어지며, 닉네임에 대한 비속어 필터링을 적용한다.

### 핵심 책임

- 계정 존재 확인 (deviceId 기반)
- 회원가입 (디바이스 ID + 닉네임 + 테마 색상)
- 로그인 (JWT 토큰 발급)
- 내 프로필 조회
- 캐릭터 변경
- 개인 출석 통계 조회

### 이 BC가 직접 만들지 않는 것

- 계정 이전 코드 생성/사용 → 별도 account-transfer 기능 (같은 모듈 내)
- 디바이스 토큰(FCM) 관리 → Device Token BC
- JWT 토큰 검증 미들웨어 → Auth 모듈 (Guard/Decorator)

## 2. 사용자 시나리오

### 시나리오 1: 앱 최초 실행 (회원가입)

1. 앱 실행 시 deviceId로 계정 확인 (GET /api/v2/auth/check-account?deviceId=...)
2. exists=false → 회원가입 플로우
3. 닉네임, 테마 색상 입력 후 POST /api/v2/auth/register 호출
4. 백엔드 처리:
   - deviceId 중복 확인
   - 닉네임 비속어 필터링
   - User 생성 (네임태그 자동 할당, 레벨 1, 경험치 0)
   - 디폴트 캐릭터 자동 지급 (UserCharacter 생성)
   - JWT 토큰 발급
5. 응답: 사용자 정보 + accessToken

### 시나리오 2: 앱 재실행 (로그인)

1. 앱 실행 시 deviceId로 계정 확인 → exists=true
2. POST /api/v2/auth/login 호출
3. 백엔드 처리:
   - deviceId로 사용자 조회
   - 미등록 deviceId면 401
   - JWT 토큰 발급
4. 응답: 사용자 정보 + accessToken

### 시나리오 3: 캐릭터 변경

1. 사용자가 보유 캐릭터 중 하나 선택
2. PATCH /api/v1/users/character 호출
3. 백엔드 처리:
   - 보유 캐릭터 확인 (UserCharacter)
   - 미보유 시 400 (`CHARACTER_NOT_OWNED`)
   - User.characterCode 업데이트
4. 응답: 변경된 사용자 정보

## 3. 기능 요구사항

### 인증 (V2 — 현행)

- [x] GET /api/v2/auth/check-account?deviceId= (Public)
- [x] deviceId로 계정 존재 여부 확인
- [x] 응답: exists (boolean)

- [x] POST /api/v2/auth/login (Public)
- [x] 입력: deviceId
- [x] 검증: 미등록 deviceId (`AUTHENTICATION_FAILED`)
- [x] 응답: 사용자 정보 + accessToken

- [x] POST /api/v2/auth/register (Public)
- [x] 입력: deviceId, nickname, preferredThemeColor
- [x] 검증: deviceId 중복 (`USER_ALREADY_EXISTS`)
- [x] 검증: nickname 2~5자 (`NICKNAME_TOO_SHORT`, `NICKNAME_TOO_LONG`)
- [x] 검증: 비속어 (`NICKNAME_CONTAINS_PROFANITY`)
- [x] 자동 처리: 네임태그 할당, 디폴트 캐릭터 지급, 레벨 1, 경험치 0
- [x] 응답: 사용자 정보 + accessToken

### 인증 (V1 — 로컬 개발/테스트 전용)

- [x] GET /api/v1/auth/check-account?deviceId= (Public)
- [x] POST /api/v1/auth/login (Public)
- [x] POST /api/v1/auth/register (Public)
- [x] V2와 동일한 로직이지만 API Key + Platform Attestation 검증 없음
- [x] `LocalOnlyGuard` 적용 — 프로덕션 환경에서 403 `API_VERSION_DEPRECATED` 반환

### 사용자 프로필

- [x] GET /api/v1/users/me (인증 필수)
- [x] 프로필 정보 반환 (닉네임, 네임태그, 캐릭터, 레벨, 경험치, 테마 색상)

- [x] PATCH /api/v1/users/character (인증 필수)
- [x] 입력: characterCode
- [x] 검증: 보유 캐릭터 확인 (`CHARACTER_NOT_OWNED`)
- [x] 즉시 반영, 쿨타임/비용 없음

### 출석 통계

- [x] GET /api/v1/users/attendance-statistics (인증 필수)
- [x] 도착/지각/부재 횟수 + 전체 참여 횟수 + 출석률 반환

## 4. 범위

### 미포함 (후속)

- 소셜 로그인 (카카오, 구글 등)
- 프로필 수정 (닉네임 변경, 테마 색상 변경)
- 회원 탈퇴
- Refresh Token Rotation

### 명시적 제외

- FCM 디바이스 토큰 관리 → Device Token BC
- 계정 이전 코드 → 같은 모듈 내 별도 기능

## 5. 전제 조건 및 제약사항

- V2 API는 API Key + Platform Attestation 헤더 필수 (X-API-Key, X-Platform, X-Attestation-Token)
- V1 API는 하위 호환용으로 유지 (Attestation 없음)
- 디바이스 ID는 UNIQUE 제약 — 1기기 1계정
- 네임태그는 서버에서 자동 생성, 중복 방지 (UNIQUE 제약)
- 회원가입 시 디폴트 캐릭터(isDefault=true) 자동 지급
