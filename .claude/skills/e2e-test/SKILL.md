---
name: e2e-test
description: 'E2E 스펙 문서 기반 테스트 코드 생성. e2e-config.md 설정과 참조 테스트를 학습하여 컨벤션에 맞는 E2E 테스트를 자동 생성. "e2e 테스트 생성", "e2e test", "테스트 코드 생성" 키워드 사용 시 실행.'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
user-invocable: true
argument-hint: '<spec-doc-path>'
---

# E2E 테스트 코드 생성 스킬

## IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 이 스킬 사용을 고려해야 합니다:**

### 실행 트리거 (Invoke Triggers)

- "e2e 테스트 생성", "e2e 테스트 작성"
- "e2e test", "e2e 코드 생성"
- "테스트 코드 생성해줘"
- "스펙 문서로 테스트 만들어줘"

**실행 방법:**

```typescript
// 스펙 문서 경로 지정 (필수)
Skill({ skill: 'e2e-test', args: 'docs/e2e/p1-notice.md' });
```

**권장 사항:**

- ✅ `.claude/e2e-config.md`가 존재할 때 사용 (없으면 `/e2e-init` 먼저 실행)
- ✅ E2E 스펙 문서가 준비되어 있을 때 사용
- ⚠️ 기존 테스트 파일이 있으면 덮어쓸지 확인

---

E2E 스펙 문서와 컨트롤러를 분석하여, 프로젝트 컨벤션에 맞는 E2E 테스트 코드를 생성합니다.

## 🎯 목표

1. 스펙 문서의 테스트 시나리오를 코드로 변환
2. 프로젝트 컨벤션(e2e-config.md)을 정확히 준수
3. 필요시 seed 헬퍼 생성 및 등록

## 📥 인자 처리

- `$ARGUMENTS` (필수): E2E 스펙 문서 경로
  - 예: `docs/e2e/p1-notice.md`
  - 미지정 시 → 사용자에게 경로 입력 요청

## 📚 패턴 문서 (필수 참조)

구현 전 반드시 `${CLAUDE_SKILL_DIR}/patterns/` 디렉토리의 패턴 문서를 읽고 코드 스타일을 학습합니다.
참조 테스트가 없는 경우 이 패턴 문서가 유일한 코드 스타일 기준입니다.

| 패턴 문서                    | 내용                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `patterns/file-structure.md` | 파일 레이아웃, import 순서, 타입 정의, 상수, 완전한 예시                                                                                                     |
| `patterns/crud.md`           | CREATE/READ/UPDATE/DELETE 기본 패턴, 공개 API, 404                                                                                                           |
| `patterns/auth.md`           | 로그인 헬퍼, 401/403, 토큰 갱신, 소셜 로그인                                                                                                                 |
| `patterns/advanced.md`       | 페이지네이션, 검색, 필터, 상태 전이, 기간 검증, 파일 첨부, sortOrder, 최대 개수, 디폴트 교체, 의존성 삭제 제약, DB 부수효과, 중복 409, 공개/관리자 필드 차이 |

**패턴 적용 우선순위:**

```
1순위: 참조 테스트 (e2e-config.md "3. 참조 테스트"에 명시된 파일)
2순위: 패턴 문서 (patterns/*.md)
3순위: e2e-config.md의 코드 패턴 템플릿 (섹션 5)
```

- 참조 테스트가 있으면 → 참조 테스트의 실제 스타일을 우선 따름
- 참조 테스트가 없으면 → 패턴 문서를 기준으로 코드 생성

## 📋 실행 프로세스

### Step 0: 사전 조건 확인

#### 0-1. e2e-config.md 존재 확인

`.claude/e2e-config.md` 파일을 읽습니다.

- **존재함**: 설정을 로드하고 Step 1로 진행
- **존재하지 않음**: 사용자에게 안내 후 중단

```
❌ .claude/e2e-config.md가 없습니다.
먼저 `/e2e-init` 을 실행하여 프로젝트 설정을 초기화하세요.
```

#### 0-2. 스펙 문서 존재 확인

`$ARGUMENTS` 경로의 스펙 문서를 읽습니다.

- **존재함**: Step 1로 진행
- **존재하지 않음**: 사용자에게 안내 후 중단

#### 0-3. 기존 테스트 파일 확인

스펙 문서에서 모듈명을 추출하여 기존 테스트 파일 존재 여부를 확인합니다.

- **존재함**: 사용자에게 덮어쓸지 확인
- **존재하지 않음**: 바로 진행

### Step 1: 컨텍스트 수집

다음 파일들을 **병렬**로 읽습니다:

#### 1-1. e2e-config.md에서 추출

- 기술 스택 (프레임워크, ORM, 테스트 러너)
- API 설정 (접두사, 버전)
- 에러 응답 구조
- 인증 설정 (헤더, 역할, 에러코드)
- 코드 패턴 템플릿 (훅, 검증, seed, CRUD)
- 기존 seed 함수 목록
- DB 초기화 테이블 목록

#### 1-2. 스펙 문서에서 추출

스펙 문서는 다음 구조를 따릅니다 (작성 가이드가 있으면 함께 참조):

- 프로젝트에 `docs/e2e/GUIDE.md`가 존재하면 → 스펙 문서 포맷 규칙으로 사용
- 존재하지 않으면 → 스펙 문서 자체의 마크다운 구조에서 추출

**추출 항목:**

- 모듈명, 우선순위 (문서 헤더 또는 메타 정보)
- 관련 컨트롤러 경로 (문서 상단에 명시)
- 사전 조건 (Preconditions 섹션)
- 테스트 시나리오 목록: TC ID, 분류(Happy Path/인증/비즈니스), 엔드포인트, HTTP 메서드, 요청/응답 필드, 검증 항목
- 제거된 시나리오 및 근거 (있는 경우)

#### 1-3. 컨트롤러 및 DTO 코드 읽기

스펙 문서에 컨트롤러 경로가 명시되어 있으면 해당 파일을 직접 읽습니다.
명시되지 않은 경우, 다음 경로 패턴으로 탐색합니다:

**파일 탐색 규칙:**

```
컨트롤러:
  src/module/{module}/presentation/controllers/*.controller.ts
  src/module/{module}/*.controller.ts

Request DTO:
  src/module/{module}/presentation/dtos/*.request.dto.ts
  src/module/{module}/presentation/dtos/*.request.ts

Response DTO:
  src/module/{module}/presentation/dtos/*.response.dto.ts
  src/module/{module}/application/dtos/*.response.dto.ts

Transformer:
  src/module/{module}/presentation/transformers/*.transformer.ts
  src/module/{module}/presentation/*.transformer.ts
```

> `{module}`은 스펙 문서의 모듈명에서 추출합니다.
> 위 경로에서 찾을 수 없으면 Glob으로 `src/**/*{module}*.controller.ts` 패턴 탐색합니다.

**추출 항목:**

- 실제 엔드포인트 경로 및 HTTP 메서드 (`@Controller`, `@Get`, `@Post` 등)
- 요청 DTO (Request Body 필드, 검증 데코레이터)
- 응답 DTO (Response Body 필드)
- 인증 가드 / 역할 데코레이터 (`@UseGuards`, `@Roles` 등)
- 호출하는 UseCase 클래스

#### 1-4. 참조 테스트 읽기 (있는 경우)

e2e-config.md의 "3. 참조 테스트"에 명시된 파일을 읽어 실제 패턴을 학습:

- import 문 구조
- 응답 타입 인터페이스 정의 방식
- 상수 정의 방식
- login 헬퍼 함수 구현
- seed 함수 호출 패턴
- 검증 패턴 (expectSuccess, expectError 사용법)

### Step 2: 응답 타입 분석

컨트롤러의 Response DTO와 Transformer를 분석하여 테스트에서 사용할 응답 타입 인터페이스를 설계합니다.

**분석 순서:**

1. 컨트롤러에서 반환 타입 확인
2. Response DTO 파일 읽기
3. Transformer 파일 읽기 (있는 경우)
4. 실제 API 응답 구조 파악
5. 테스트용 인터페이스 작성

**규칙:**

- 목록 응답: `{Entity}ListBody` (items, totalCount, totalPages, currentPage)
- 상세 응답: `{Entity}DetailBody`
- 관리자 전용 필드가 있으면 `Admin{Entity}DetailBody` 별도 정의
- nullable 필드는 `| null` 표기
- 날짜 필드는 `string` 타입

### Step 3: Seed 필요성 판단

스펙 문서의 사전 조건과 테스트 시나리오를 분석하여 필요한 seed 함수를 판단합니다.

#### 3-1. 기존 seed 함수 확인

e2e-config.md의 "6. Seed 헬퍼 등록부"와 실제 `seed/index.ts` 배럴 파일을 확인합니다.

#### 3-2. 새 seed 필요 여부

- **기존 seed로 충분**: 바로 Step 4로 진행
- **새 seed 필요**: seed 함수 생성 (Step 3-3)

#### 3-3. Seed 함수 생성 (필요시)

e2e-config.md의 "5-5. Seed 패턴"을 따라 새 seed 함수를 생성합니다:

1. `test/helpers/seed/{entity}.seed.ts` 파일 생성
2. `test/helpers/seed/index.ts` 배럴에 export 추가
3. `test/helpers/seed.helper.ts` 배럴에 re-export 추가 (있는 경우)
4. e2e-config.md의 "6. Seed 헬퍼 등록부"에 등록

**seed 함수 작성 규칙:**

- Prisma 스키마(또는 해당 ORM 스키마)를 참조하여 필드 정의
- `overrides` 파라미터로 기본값 오버라이드 지원
- ID는 `ulid()` 등 프로젝트 컨벤션에 맞는 생성 방식 사용
- 반환 타입 `Seeded{Entity}` 인터페이스 정의

### Step 4: 테스트 코드 생성

스펙 문서의 각 TC를 코드로 변환합니다.

#### 4-1. 파일 구조

e2e-config.md의 "4-1. 파일 레이아웃"을 따릅니다:

```
1. import 문
2. 응답 타입 인터페이스
3. URL/자격증명 상수
4. describe 블록
```

#### 4-2. import 문 작성

```typescript
// 1) 외부 라이브러리
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// 2) 내부 모듈 (ORM 서비스 등)
import { PrismaService } from '{경로}';

// 3) 테스트 헬퍼
import { createTestApp } from '{경로}';
import { cleanDatabase } from '{경로}';
import { expectError, expectSuccess } from '{경로}';

// 4) Seed 함수
import { seedXxx, seedYyy } from '{경로}';
```

> 실제 경로는 참조 테스트 또는 e2e-config.md의 디렉토리 구조를 따릅니다.

#### 4-3. 상수 정의

```typescript
const LOGIN_URL = '/api/v1/admin-auth/login';
const ENDPOINT_URL = '/api/v1/admin/{resources}';
const PUBLIC_URL = '/api/v1/{resources}';
const VALID_PASSWORD = 'P@ssw0rd!';
const ADMIN_LOGIN_ID = 'test-admin';
```

#### 4-4. describe/it 구조

e2e-config.md의 "4-2. describe/it 네이밍"을 따릅니다:

```typescript
describe('{모듈명} E2E', () => {
  // 변수 선언, 훅, login 헬퍼

  // ── {METHOD} {path} ──────────────────────────────
  describe('{METHOD} {full-path}', () => {
    it('TC-{CODE}-{NUM}: {설명}', async () => {
      // Given
      // When
      // Then
    });
  });
});
```

#### 4-5. TC 변환 규칙

스펙 문서의 각 TC를 다음과 같이 변환합니다:

**Given (사전 조건):**

- 스펙의 "사전 조건" + TC별 전제조건 → seed 함수 호출
- 인증이 필요하면 → seed + login 헬퍼

**When (액션):**

- 스펙의 "요청" → supertest API 호출
- HTTP 메서드, URL, 헤더, 바디 매핑

**Then (검증):**

- 스펙의 "기대 결과" → expectSuccess / expectError
- 스펙의 "검증 항목" → expect 문
- DB 부수효과 → prisma 직접 조회 (기준 충족시만)

### Step 5: DB 초기화 테이블 갱신

새로운 테이블이 필요한 경우:

1. `test/helpers/db-cleanup.helper.ts`의 테이블 목록에 추가
2. e2e-config.md의 "7. DB 초기화 테이블 목록"에 등록

### Step 6: TC ID 등록

e2e-config.md의 "4-3. TC ID 모듈 코드" 테이블에 새 모듈 코드를 등록합니다.

### Step 7: 검증

생성된 파일의 TypeScript 구문 오류를 확인합니다:

```bash
npx tsc --noEmit --project test/tsconfig.json 2>&1 | head -30
```

> tsconfig.json이 없으면 jest-e2e.json 기반으로 확인합니다.

## 🎯 실행 결과 출력

```
✅ E2E 테스트 생성 완료

스펙 문서: {$ARGUMENTS}
모듈 코드: {MODULE_CODE}

생성/수정된 파일:
- test/{module}/{module}.e2e-spec.ts (TC {N}개)
- test/helpers/seed/{entity}.seed.ts (신규 생성 시)
- test/helpers/seed/index.ts (배럴 업데이트 시)
- test/helpers/db-cleanup.helper.ts (테이블 추가 시)
- .claude/e2e-config.md (등록부 업데이트)

테스트 실행:
npm run test:e2e -- --testPathPattern={module}
```

## ⚠️ 주의사항

1. **e2e-config.md 필수**: 설정 파일 없이 실행하면 안 됨
2. **스펙 문서 충실도**: 스펙에 정의된 TC만 생성 (추가 TC 임의 생성 금지)
3. **컨트롤러 참조**: 실제 엔드포인트 경로와 DTO를 반드시 확인
4. **참조 테스트 패턴 준수**: 기존 테스트와 동일한 스타일 유지
5. **seed 재사용**: 기존 seed 함수를 최대한 활용, 불필요한 중복 생성 금지
6. **한국어 작성**: TC 설명, 주석은 한국어

## 🚫 하지 말아야 할 것

- ❌ 스펙 문서에 없는 TC 임의 추가
- ❌ DTO 입력 검증 테스트 (유닛 테스트 영역)
- ❌ Edge Case 테스트 (빈 문자열, 경계값)
- ❌ 같은 컨트롤러 내 중복 인증 검증 (대표 1개만)
- ❌ 토큰 내부 형식 검증 (JWT split 등)
- ❌ 참조 테스트와 다른 스타일로 작성
