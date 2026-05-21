# 인증 API V2 프론트엔드 연동 가이드

## 개요

인증 API가 V1 → V2로 업그레이드되었습니다. V2에서는 보안 강화를 위해 **API Key**와 **Platform Attestation** 검증이 추가됩니다.

### V1 vs V2 차이점

| 항목                  | V1 (`/v1/auth/*`) | V2 (`/v2/auth/*`)                                   |
| --------------------- | ----------------- | --------------------------------------------------- |
| API Key               | 불필요            | **필수** (`X-API-Key` 헤더)                         |
| Platform Attestation  | 불필요            | **필수** (`X-Platform`, `X-Attestation-Token` 헤더) |
| Request/Response Body | 동일              | 동일                                                |
| 비즈니스 로직         | 동일              | 동일                                                |

> V1 API는 하위 호환을 위해 당분간 유지되지만, 앱 업데이트 시 V2로 전환해야 합니다. V1은 추후 폐기 예정입니다.

---

## 필수 헤더

V2 인증 API 호출 시 아래 3개 헤더가 **모두 필수**입니다.

```
X-API-Key: {서버에서 발급받은 API Key}
X-Platform: android | ios
X-Attestation-Token: {Play Integrity 또는 App Attest 토큰}
```

| 헤더                  | 값                   | 설명                                                      |
| --------------------- | -------------------- | --------------------------------------------------------- |
| `X-API-Key`           | 고정 문자열          | 서버 담당자에게 발급받은 앱 전용 시크릿 키                |
| `X-Platform`          | `android` 또는 `ios` | 클라이언트 플랫폼                                         |
| `X-Attestation-Token` | 토큰 문자열          | Android: Play Integrity token / iOS: App Attest assertion |

---

## API 엔드포인트

### 1. 계정 존재 확인

```
GET /v2/auth/check-account?deviceId={deviceId}
```

**Request:**

| 파라미터   | 위치  | 타입   | 필수 | 설명                |
| ---------- | ----- | ------ | ---- | ------------------- |
| `deviceId` | Query | string | O    | OS 제공 디바이스 ID |

**Response (200):**

```json
{
  "exists": true
}
```

| 필드     | 타입    | 설명                                                  |
| -------- | ------- | ----------------------------------------------------- |
| `exists` | boolean | `true`: 자동 로그인 플로우 / `false`: 회원가입 플로우 |

---

### 2. 로그인

```
POST /v2/auth/login
```

**Request Body:**

```json
{
  "deviceId": "EA7D1F4B23CCDE45"
}
```

| 필드       | 타입   | 필수 | 설명                |
| ---------- | ------ | ---- | ------------------- |
| `deviceId` | string | O    | OS 제공 디바이스 ID |

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "bf40736b637dd9af16d254f18f08adfe02e8e0cc6e5e..."
}
```

---

### 3. 회원가입

```
POST /v2/auth/register
```

**Request Body:**

```json
{
  "deviceId": "EA7D1F4B23CCDE45",
  "nickname": "홍길동",
  "preferredThemeColor": "#FF5733"
}
```

| 필드                  | 타입   | 필수 | 설명                 |
| --------------------- | ------ | ---- | -------------------- |
| `deviceId`            | string | O    | OS 제공 디바이스 ID  |
| `nickname`            | string | O    | 닉네임 (2~5자)       |
| `preferredThemeColor` | string | O    | 선호 테마 색상 (hex) |

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "bf40736b637dd9af16d254f18f08adfe02e8e0cc6e5e..."
}
```

---

## 에러 응답

V2에서 추가된 에러 코드입니다. 기존 V1 에러 코드는 그대로 유지됩니다.

| HTTP Status | 에러 코드              | 원인                                  | 대응 방법                       |
| ----------- | ---------------------- | ------------------------------------- | ------------------------------- |
| 403         | `INVALID_API_KEY`      | API Key 누락 또는 불일치              | `X-API-Key` 헤더 확인           |
| 403         | `UNSUPPORTED_PLATFORM` | `X-Platform` 헤더 누락 또는 잘못된 값 | `android` 또는 `ios`만 허용     |
| 403         | `ATTESTATION_REQUIRED` | `X-Attestation-Token` 헤더 누락       | Attestation 토큰 발급 후 재요청 |
| 403         | `ATTESTATION_FAILED`   | Attestation 검증 실패                 | 앱 무결성 또는 기기 무결성 문제 |

---

## Android 연동 가이드: Play Integrity

### 의존성 추가

```groovy
// build.gradle (app)
dependencies {
    implementation "com.google.android.play:integrity:1.4.0"
}
```

### Integrity Token 발급

```kotlin
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest

class PlayIntegrityHelper(private val context: Context) {

    /**
     * Play Integrity 토큰을 발급받습니다.
     * 이 토큰을 서버 API 호출 시 X-Attestation-Token 헤더에 포함합니다.
     */
    suspend fun getIntegrityToken(): String {
        val integrityManager = IntegrityManagerFactory.create(context)

        val request = IntegrityTokenRequest.builder()
            .setCloudProjectNumber(CLOUD_PROJECT_NUMBER)  // Google Cloud 프로젝트 번호
            .build()

        val response = integrityManager
            .requestIntegrityToken(request)
            .await()

        return response.token()
    }

    companion object {
        // Google Cloud Console에서 확인 가능한 프로젝트 번호
        private const val CLOUD_PROJECT_NUMBER = 123456789L
    }
}
```

### API 호출 예시

```kotlin
class AuthApiClient(
    private val httpClient: OkHttpClient,
    private val playIntegrityHelper: PlayIntegrityHelper,
) {
    companion object {
        private const val API_KEY = "서버에서-발급받은-API-Key"
        private const val BASE_URL = "https://api.yourapp.com"
    }

    /**
     * V2 로그인 API 호출 예시
     */
    suspend fun login(deviceId: String): AuthResponse {
        // 1. Play Integrity 토큰 발급
        val integrityToken = playIntegrityHelper.getIntegrityToken()

        // 2. API 호출
        val request = Request.Builder()
            .url("$BASE_URL/v2/auth/login")
            .post(
                """{"deviceId": "$deviceId"}"""
                    .toRequestBody("application/json".toMediaType())
            )
            // 3. 필수 헤더 추가
            .addHeader("X-API-Key", API_KEY)
            .addHeader("X-Platform", "android")
            .addHeader("X-Attestation-Token", integrityToken)
            .build()

        val response = httpClient.newCall(request).execute()
        // ... 응답 처리
    }
}
```

### Retrofit 사용 시

```kotlin
// Interceptor로 헤더를 자동 추가
class AuthHeaderInterceptor(
    private val playIntegrityHelper: PlayIntegrityHelper,
) : Interceptor {

    companion object {
        private const val API_KEY = "서버에서-발급받은-API-Key"
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // /v2/auth/* 경로에만 헤더 추가
        if (!original.url.encodedPath.startsWith("/v2/auth")) {
            return chain.proceed(original)
        }

        val integrityToken = runBlocking {
            playIntegrityHelper.getIntegrityToken()
        }

        val request = original.newBuilder()
            .addHeader("X-API-Key", API_KEY)
            .addHeader("X-Platform", "android")
            .addHeader("X-Attestation-Token", integrityToken)
            .build()

        return chain.proceed(request)
    }
}
```

---

## iOS 연동 가이드: App Attest

> App Attest는 서버 측 구현이 아직 진행 중입니다. iOS 연동 가이드는 서버 구현 완료 후 업데이트됩니다.
> 당분간 iOS는 `X-Attestation-Token`에 빈 문자열을 전송하고, 서버에서 `ATTESTATION_ENABLED=false`로 설정하여 검증을 건너뜁니다.

---

## 앱 실행 플로우 (V2)

```
앱 실행
  │
  ├─ 1. Play Integrity 토큰 발급 (앱 시작 시 또는 API 호출 직전)
  │
  ├─ 2. GET /v2/auth/check-account?deviceId=...
  │     Headers: X-API-Key, X-Platform, X-Attestation-Token
  │     │
  │     ├─ exists: false → 3a. POST /v2/auth/register
  │     └─ exists: true  → 3b. POST /v2/auth/login
  │
  ├─ 4. 응답에서 accessToken, refreshToken 저장
  │     - Android: EncryptedSharedPreferences
  │     - iOS: Keychain
  │
  └─ 5. 이후 API 호출 시 Authorization: Bearer {accessToken} 사용
        (기존 V1과 동일, 추가 헤더 불필요)
```

> 인증 완료 후(JWT 발급 후)의 API 호출은 기존과 동일합니다. `X-API-Key`, `X-Attestation-Token` 헤더는 **인증 API(`/v2/auth/*`)에만** 필요합니다.

---

## V1 → V2 마이그레이션 체크리스트

- [ ] API 베이스 경로를 `/v1/auth/*` → `/v2/auth/*`로 변경
- [ ] API Key를 앱에 안전하게 저장 (Android: `BuildConfig`, iOS: `Info.plist` 또는 코드 내 상수)
- [ ] Play Integrity 라이브러리 의존성 추가 (`com.google.android.play:integrity`)
- [ ] API 호출 시 `X-API-Key`, `X-Platform`, `X-Attestation-Token` 헤더 추가
- [ ] 403 에러 코드 처리 (`INVALID_API_KEY`, `ATTESTATION_FAILED` 등)
- [ ] 인증 완료 후 API 호출은 기존과 동일한지 확인 (변경 없음)

---

## FAQ

**Q: Play Integrity 토큰은 매 API 호출마다 새로 발급받아야 하나요?**
A: 네. Integrity 토큰은 일회성이므로 매 요청마다 새로 발급받아야 합니다.

**Q: Play Integrity 토큰 발급이 실패하면 어떻게 하나요?**
A: Google Play Services가 없는 기기(에뮬레이터, 커스텀 ROM 등)에서는 토큰 발급이 실패할 수 있습니다. 사용자에게 "이 기기에서는 서비스를 사용할 수 없습니다" 안내를 표시하세요.

**Q: 개발 중에는 어떻게 테스트하나요?**
A: 개발 서버에서는 `ATTESTATION_ENABLED=false`로 설정되어 있어 Attestation 검증을 건너뜁니다. `X-Attestation-Token`에 아무 값이나 넣어도 통과됩니다. 단, `X-API-Key`는 개발 환경에서도 유효한 값이 필요합니다.

**Q: API Key는 앱에 하드코딩해도 안전한가요?**
A: API Key 단독으로는 안전하지 않지만, Play Integrity와 함께 사용하므로 괜찮습니다. 앱을 디컴파일해서 API Key를 알아내더라도 Integrity 토큰을 위조할 수 없으므로 서버에서 거부됩니다. 추가로 ProGuard/R8 난독화를 적용하면 더 안전합니다.

**Q: 기존 V1 API는 언제까지 사용 가능한가요?**
A: V2 전환 완료 후 충분한 유예 기간을 두고 폐기할 예정입니다. 정확한 일정은 별도 공지됩니다.
