---
name: e2e-init
description: 'E2E 테스트 프로젝트 설정 초기화. 프로젝트를 분석하여 e2e-config.md 생성. "e2e 초기화", "e2e init", "e2e 설정" 키워드 사용 시 실행.'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
user-invocable: true
argument-hint: '[test-dir]'
---

# E2E 테스트 프로젝트 초기화 스킬

## IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 이 스킬 사용을 고려해야 합니다:**

### 실행 트리거 (Invoke Triggers)

- "e2e 초기화", "e2e init"
- "e2e 설정", "e2e 세팅"
- "e2e 테스트 환경 구성"
- "e2e config 생성"

**실행 방법:**

```typescript
// 인자 없이 호출 (자동 감지)
Skill({ skill: 'e2e-init' });

// 참조 테스트 디렉토리 지정
Skill({ skill: 'e2e-init', args: 'test/' });
```

**권장 사항:**

- ✅ 새 프로젝트에서 E2E 테스트를 처음 시작할 때
- ✅ 기존 프로젝트에 E2E 테스트 컨벤션을 정립할 때
- ⚠️ 이미 `.claude/e2e-config.md`가 존재하면 덮어쓸지 확인

---

프로젝트를 자동 분석하여 E2E 테스트 설정 파일(`.claude/e2e-config.md`)을 생성합니다.

## 🎯 목표

프로젝트의 기술 스택, 인증 방식, API 구조 등을 분석하고, E2E 테스트 생성에 필요한 설정과 템플릿을 `.claude/e2e-config.md`에 기록합니다.

## 📥 인자 처리

- `$ARGUMENTS` (선택): 참조 테스트가 있는 디렉토리 경로
  - 지정됨 → 해당 디렉토리에서 기존 테스트 패턴을 학습
  - 미지정 → 프로젝트 내 `test/`, `tests/`, `e2e/` 등을 자동 탐색
  - 탐색 결과 없음 → 인라인 범용 템플릿 사용 (Case B)

## 📋 실행 프로세스

### Step 0: 기존 설정 확인

`.claude/e2e-config.md` 파일이 이미 존재하는지 확인합니다.

- **존재함**: 사용자에게 덮어쓸지 확인 후 진행
- **존재하지 않음**: 바로 Step 1로 진행

### Step 1: 프로젝트 자동 분석

다음 파일들을 읽어 프로젝트 기술 스택을 자동 감지합니다.

#### 1-1. 패키지 분석

`package.json`을 읽고 다음을 감지:

| 감지 항목   | 확인 대상 (dependencies / devDependencies)                   |
| ----------- | ------------------------------------------------------------ |
| 프레임워크  | `@nestjs/core`, `express`, `fastify`, `koa`                  |
| ORM         | `prisma`, `typeorm`, `sequelize`, `drizzle-orm`, `mikro-orm` |
| 테스트 러너 | `jest`, `vitest`, `mocha`                                    |
| HTTP 테스트 | `supertest`, `pactum`, `axios`                               |
| 테스트 DB   | `testcontainers`, `@testcontainers/*`                        |
| 인증        | `@nestjs/jwt`, `passport`, `jsonwebtoken`                    |
| 검증        | `class-validator`, `zod`, `joi`                              |

#### 1-2. 기존 테스트 구조 분석

참조 디렉토리(`$ARGUMENTS` 또는 자동 탐색)에서 다음을 확인:

- `*.e2e-spec.ts` 또는 `*.e2e-test.ts` 파일 존재 여부
- `jest-e2e.json` 또는 `vitest.config.e2e.ts` 존재 여부
- `helpers/` 또는 `utils/` 디렉토리
- `setup/` 디렉토리

#### 1-3. API 구조 분석

- `main.ts` 또는 bootstrap 파일에서 API prefix, versioning 확인
- controller 파일들에서 경로 패턴 파악
- 인증 가드/미들웨어 패턴 확인

#### 1-4. 에러 응답 구조 분석

- GlobalExceptionFilter 또는 에러 핸들러 파일
- 에러 응답 필드 구조 (errorCode, statusCode, message 등)
- 커스텀 예외 클래스 구조

### Step 2: 분석 결과 출력

감지된 내용을 사용자에게 요약 출력합니다:

```
📊 프로젝트 분석 결과

프레임워크: {감지 결과}
ORM: {감지 결과}
테스트 러너: {감지 결과}
인증: {감지 결과}
API 접두사: {감지 결과}

기존 테스트: {N개 파일 발견 / 없음}
```

### Step 3: 참조 테스트 결정

#### Case A: 기존 테스트 존재

참조 테스트 파일을 자동 선택합니다 (최대 3개):

**선택 점수 기준 (높은 순서대로 정렬):**

1. **CRUD 완전성** (가중치 높음): POST, GET, PATCH, DELETE 4개를 모두 포함하는 파일 우선
2. **인증 검증 포함**: 401/403 에러 테스트가 있는 파일 가산
3. **TC 다양성**: TC 개수가 많은 파일 가산

**선택 전략:**

- 1번 파일: CRUD + 인증 + 비즈니스 규칙이 가장 많은 파일 (예: notice, center-program)
- 2번 파일: 인증 플로우 전문 파일 (예: admin-auth, user-auth)
- 3번 파일: 1번과 다른 패턴을 포함하는 파일 (예: 계층구조, 파일첨부, 상태전이)

선택된 파일을 분석하여 다음을 추출:

- 파일 레이아웃 패턴 (import 순서, 타입 정의 위치, 상수 정의)
- describe/it 네이밍 컨벤션
- 헬퍼 함수 사용 패턴 (앱 생성, DB 초기화, 인증, 검증)
- seed 데이터 패턴

#### Case B: 기존 테스트 없음

`${CLAUDE_SKILL_DIR}/templates/e2e-config-template.md`의 범용 템플릿을 사용합니다.
아래 **프레임워크별 기본값 매핑**을 사용하여 플레이스홀더를 구체적인 값으로 치환합니다.

### Step 3-B: 프레임워크별 기본값 매핑

참조 테스트가 없을 때, Step 1에서 감지된 프레임워크/ORM 조합에 따라 다음 기본값을 적용합니다.

#### NestJS + Prisma

```typescript
// 앱 타입
let app: INestApplication<App>;
let prisma: PrismaService;

// 앱 생성 (테스트 앱 헬퍼)
beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication();
  // main.ts와 동일한 설정 (prefix, versioning, pipes 등)
  await app.init();
  prisma = app.get(PrismaService);
});

// DB 초기화
beforeEach(async () => {
  // FK 체크 비활성화 → 모든 테이블 DELETE → FK 체크 재활성화
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  // ... 테이블별 deleteMany
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
});

// 검증 헬퍼
function expectSuccess<T>(response: Response, statusCode: number): T {
  expect(response.status).toBe(statusCode);
  return response.body as T;
}

function expectError(response: Response, expected: { statusCode: number; errorCode: string }) {
  expect(response.status).toBe(expected.statusCode);
  expect(response.body.errorCode).toBe(expected.errorCode);
}

// 인증
.set('Authorization', `Bearer ${accessToken}`)

// ID 생성
import { ulid } from 'ulid';
const id = ulid();
```

#### NestJS + TypeORM

```typescript
let app: INestApplication;
let dataSource: DataSource;

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleFixture.createNestApplication();
  await app.init();
  dataSource = app.get(DataSource);
});

beforeEach(async () => {
  await dataSource.synchronize(true); // DB 초기화
});
```

#### Express + Prisma

```typescript
let app: Express;
let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient();
  app = createApp(prisma); // Express 앱 팩토리 (app.ts에서 export)
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  await prisma.$transaction([
    // 프로젝트의 Prisma 스키마에서 모델 목록을 참조하여 나열
    // prisma.tableName.deleteMany(),
  ]);
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
});

// 검증 헬퍼 (NestJS와 동일)
function expectSuccess<T>(response: request.Response, statusCode: number): T {
  expect(response.status).toBe(statusCode);
  return response.body as T;
}

function expectError(
  response: request.Response,
  expected: { statusCode: number; errorCode: string },
) {
  expect(response.status).toBe(expected.statusCode);
  expect(response.body.errorCode).toBe(expected.errorCode);
}
```

#### 공통 기본값

| 항목        | NestJS + Prisma         | NestJS + TypeORM    | Express + Prisma        |
| ----------- | ----------------------- | ------------------- | ----------------------- |
| 앱 타입     | `INestApplication<App>` | `INestApplication`  | `Express`               |
| ORM 서비스  | `PrismaService`         | `DataSource`        | `PrismaClient`          |
| DB 초기화   | FK OFF → DELETE → FK ON | `synchronize(true)` | FK OFF → DELETE → FK ON |
| ID 생성     | `ulid()`                | `uuid()`            | `ulid()` or `uuid()`    |
| 인증 헤더   | `Bearer ${token}`       | `Bearer ${token}`   | `Bearer ${token}`       |
| HTTP 테스트 | `supertest`             | `supertest`         | `supertest`             |

### Step 4: e2e-config.md 생성

`${CLAUDE_SKILL_DIR}/templates/e2e-config-template.md` 파일을 참조하여 `.claude/e2e-config.md`를 생성합니다.

**작성 규칙:**

- **Case A (기존 테스트 있음)**: 참조 테스트에서 추출한 실제 함수명, 타입명, 경로로 플레이스홀더를 치환
- **Case B (기존 테스트 없음)**: Step 3-B의 프레임워크별 기본값 매핑으로 플레이스홀더를 구체적인 값으로 치환. 감지 불가한 항목만 플레이스홀더 유지

## 🎯 실행 결과 출력

### 성공 시

```
✅ E2E 테스트 설정 초기화 완료

생성된 파일:
- .claude/e2e-config.md

설정 요약:
- 프레임워크: {감지 결과}
- ORM: {감지 결과}
- 참조 테스트: {N개 파일 / 없음 (인라인 템플릿 사용)}

다음 단계:
1. .claude/e2e-config.md를 검토하고 필요시 수정하세요
2. E2E 스펙 문서를 준비하세요 (docs/e2e/{모듈명}.md)
3. `/e2e-test` 스킬로 테스트 코드를 생성하세요
```

### 기존 테스트 없음 안내

```
💡 참조할 기존 테스트가 없어 범용 템플릿을 사용했습니다.
첫 번째 테스트를 수동 작성한 후 `/e2e-init test/` 로 재실행하면
더 정확한 설정이 가능합니다.
```

## ⚠️ 주의사항

1. **자동 감지 우선**: 가능한 한 프로젝트 파일에서 자동 감지하여 사용자 입력을 최소화
2. **감지 실패 시**: 플레이스홀더를 남기고 사용자에게 수동 입력 안내
3. **기존 설정 보존**: 덮어쓰기 전 반드시 확인
4. **참조 테스트 선택**: 가장 다양한 패턴을 포함한 파일을 자동 선택
5. **한국어 작성**: 모든 출력과 설정 파일 내 설명은 한국어
