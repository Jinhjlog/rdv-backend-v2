# E2E Test Configuration

> 자동 생성일: {날짜}
> 이 파일은 `/e2e-test` 스킬이 E2E 테스트 코드를 생성할 때 참조하는 설정입니다.

## 1. 프로젝트 설정

### 기술 스택

| 항목            | 값                                         |
| --------------- | ------------------------------------------ |
| 프레임워크      | {NestJS / Express / Fastify}               |
| ORM             | {Prisma / TypeORM / Drizzle}               |
| 테스트 러너     | {Jest / Vitest}                            |
| HTTP 클라이언트 | {Supertest / Pactum}                       |
| 테스트 DB       | {Testcontainers / Docker Compose / SQLite} |
| 인증            | {JWT Bearer / Session / API Key / None}    |
| 검증 라이브러리 | {class-validator / Zod / Joi}              |

### API 설정

| 항목       | 값                              |
| ---------- | ------------------------------- |
| API 접두사 | {/api}                          |
| API 버전   | {/api/v1 (URI) / Header / None} |
| 응답 형식  | {JSON}                          |

### 에러 응답 구조

```typescript
// 실제 프로젝트의 에러 응답 형태
interface ErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  // {추가 필드}
}
```

### 인증 설정

| 항목               | 값                                |
| ------------------ | --------------------------------- |
| 인증 헤더          | {Authorization: Bearer \<token\>} |
| 토큰 타입          | {JWT / Opaque}                    |
| 역할 체계          | {SUPER_ADMIN, ADMIN, USER 등}     |
| 인증 없음 에러코드 | {ACCESS_TOKEN_MISSING}            |
| 권한 부족 에러코드 | {FORBIDDEN_ADMIN_ROLE}            |

## 2. 테스트 디렉토리 구조

```
{프로젝트 루트}/
├── {test 디렉토리명}/
│   ├── setup/                    # 테스트 환경 설정
│   ├── helpers/                  # 테스트 헬퍼
│   │   ├── test-app.helper.ts    # 앱 생성 헬퍼
│   │   ├── auth.helper.ts        # 인증 헬퍼
│   │   ├── db-cleanup.helper.ts  # DB 초기화
│   │   ├── assertion.helper.ts   # 응답 검증
│   │   └── seed/                 # 도메인별 seed
│   │       └── index.ts          # 배럴 파일
│   ├── {module-name}/
│   │   └── {module-name}.e2e-spec.ts
│   └── jest-e2e.json
```

## 3. 참조 테스트

### 참조 디렉토리

```
{참조 테스트 경로 또는 "없음 - 인라인 템플릿 사용"}
```

### 참조 파일 목록

{기존 테스트가 있으면 파일 경로 나열, 없으면 "해당 없음"}

## 4. 컨벤션

### 4-1. 파일 레이아웃

```typescript
// ── 순서 ──────────────────────────────────────────
// 1. import 문 (외부 → 내부 → 헬퍼 → seed)
// 2. 응답 타입 인터페이스 (해당 파일 로컬)
// 3. URL/자격증명 상수
// 4. describe 블록
```

### 4-2. describe/it 네이밍

```typescript
// 최상위 describe
describe('{모듈명} E2E', () => {
  // 엔드포인트별 describe
  describe('{METHOD} {full-path}', () => {
    // 테스트 케이스
    it('TC-{MODULE_CODE}-{NUMBER}: {한글 설명}', async () => {
      // Given - 사전 조건
      // When - API 호출
      // Then - 검증
    });
  });
});
```

### 4-3. TC ID 모듈 코드

> `/e2e-test` 스킬 실행 시 새 모듈 코드를 여기에 추가합니다.

| 모듈                             | 코드 |
| -------------------------------- | ---- |
| {감지된 모듈 매핑 또는 비어있음} |      |

### 4-4. 테스트 분류 기준

1. **Happy Path (필수)**: 정상 동작 CRUD
2. **인증/인가 검증 (필수)**: 대표 1개씩만 (401/403)
3. **비즈니스 규칙 (해당시)**: 도메인 제약조건, 상태 전이

### 4-5. 검증 원칙

**검증해야 하는 것:**

- 응답 상태 코드
- 응답 필드 존재 여부 및 값
- 에러 코드

**검증하지 말아야 하는 것:**

- 토큰 내부 형식
- DTO/Pipe 입력 검증 (유닛 테스트 영역)
- Edge Case (빈 문자열, 경계값)

**DB 부수효과 검증 기준 (두 조건 모두 충족시만):**

1. API 응답으로 확인할 수 없는 값인가?
2. 비즈니스/보안 요구사항의 핵심인가?

## 5. 코드 패턴 템플릿

### 5-1. 훅 패턴

```typescript
let app: INestApplication<App>;
let prisma: { ORM서비스타입 };

beforeAll(async () => {
  app = await { 앱생성함수 }();
  prisma = app.get({ ORM서비스클래스 });
});

afterAll(async () => {
  if (app) await app.close();
});

beforeEach(async () => {
  await { DB초기화함수 }(prisma);
});
```

### 5-2. 인증 헬퍼 패턴

```typescript
// 테스트 파일 내부에 정의하는 로그인 헬퍼
async function login(
  loginId: string,
  password: string,
): Promise<{ accessToken: string }> {
  const response = await request(app.getHttpServer())
    .post('{로그인 URL}')
    .send({ loginId, password });

  return response.body as { accessToken: string };
}
```

### 5-3. 성공 검증 패턴

```typescript
// 성공 응답 검증 + 타입 반환
const body = expectSuccess<ResponseType>(response, statusCode);
expect(body.field).toBe(expectedValue);
```

### 5-4. 에러 검증 패턴

```typescript
// 에러 응답 검증
expectError(response, {
  statusCode: 401,
  errorCode: 'ERROR_CODE',
});
```

### 5-5. Seed 패턴

```typescript
// Seed 함수 시그니처
async function seedEntity(
  prisma: { ORM서비스타입 },
  overrides: Partial<SeedEntityOptions> = {},
): Promise<SeededEntity> {
  const id = overrides.id ?? ulid();
  // ... 데이터 생성
  return { id, ...createdData };
}
```

### 5-6. 응답 타입 정의 패턴

```typescript
// 목록 응답
interface EntityListBody {
  items: Array<{
    id: string;
    // ... 필드
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// 상세 응답
interface EntityDetailBody {
  id: string;
  // ... 필드
  createdAt: string;
  updatedAt: string;
}
```

### 5-7. CRUD 테스트 패턴

```typescript
// CREATE (POST) - 201
const response = await request(app.getHttpServer())
  .post(URL)
  .set('Authorization', `Bearer ${accessToken}`)
  .send({
    /* 필드 */
  });
const body = expectSuccess<DetailBody>(response, 201);

// READ LIST (GET) - 200
const response = await request(app.getHttpServer())
  .get(URL)
  .set('Authorization', `Bearer ${accessToken}`);
const body = expectSuccess<ListBody>(response, 200);

// READ DETAIL (GET /:id) - 200
const response = await request(app.getHttpServer())
  .get(`${URL}/${id}`)
  .set('Authorization', `Bearer ${accessToken}`);
const body = expectSuccess<DetailBody>(response, 200);

// UPDATE (PATCH /:id) - 200
const response = await request(app.getHttpServer())
  .patch(`${URL}/${id}`)
  .set('Authorization', `Bearer ${accessToken}`)
  .send({
    /* 변경 필드만 */
  });
const body = expectSuccess<DetailBody>(response, 200);

// DELETE (DELETE /:id) - 204
const response = await request(app.getHttpServer())
  .delete(`${URL}/${id}`)
  .set('Authorization', `Bearer ${accessToken}`);
expect(response.status).toBe(204);
```

## 6. Seed 헬퍼 등록부

> `/e2e-test` 스킬이 새 seed 함수를 생성할 때 여기에 등록합니다.

| Seed 함수                             | 파일 경로 | 용도 |
| ------------------------------------- | --------- | ---- |
| {감지된 seed 함수 목록 또는 비어있음} |           |      |

## 7. DB 초기화 테이블 목록

> 새 모듈 추가 시 여기에 테이블을 등록합니다.

```typescript
// cleanDatabase()에서 삭제하는 테이블 목록
const TABLES_TO_CLEAN = [
  // {감지된 테이블 목록 또는 비어있음}
];
```
