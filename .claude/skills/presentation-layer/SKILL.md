---
name: presentation-layer
description: "DDD 프레젠테이션 레이어 구현. Controllers, Request/Response DTOs, Transformers를 생성. \"프레젠테이션 레이어 구현\" 또는 \"presentation layer\" 키워드 사용 시 실행."
allowed-tools: Read, Write, Glob, Grep, Bash
user-invocable: true
---

# Presentation Layer 구현 스킬

## ⚠️ IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 이 스킬 사용을 고려해야 합니다:**

### 실행 트리거 (Invoke Triggers)

- "프레젠테이션 레이어 구현"
- "Controller 만들어줘", "컨트롤러 생성"
- "API 엔드포인트 추가"
- "Request DTO 작성", "Response DTO 작성"
- "Transformer 추가"
- "presentation layer implementation"
- "create controller", "add endpoint"

**실행 방법:**
```typescript
// 사용자 요청 감지 시 다음을 호출
Skill({ skill: "presentation-layer" })
```

**권장 사항:**
- ✅ 여러 엔드포인트를 한 번에 생성할 때 이 스킬 사용 권장
- ✅ 역할별 Controller 구조가 복잡할 때 이 스킬 사용
- ⚠️ 간단한 엔드포인트는 직접 구현도 가능

---

DDD(Domain-Driven Design) 패턴에 따라 프레젠테이션 레이어를 구현합니다.

## 📋 실행 프로세스

### 1단계: 요구사항 분석

요구사항 문서를 읽고 다음을 판단합니다:

```markdown
# 판단 기준

- 어떤 API 엔드포인트가 필요한가?
  - POST (생성)
  - GET (조회 - 목록/상세)
  - PATCH (수정)
  - DELETE (삭제)
- 어떤 역할(Role)이 접근하는가?
  - super-admin, company-admin, user, my 등
- Request DTOs가 필요한가?
- Response DTOs가 필요한가?
- Transformer가 필요한가?
```

**⏭️ 스킵 조건**:

- Application Layer가 없는 경우
- API 엔드포인트가 필요하지 않은 경우

스킵 시 다음과 같이 출력:

```
⏭️ Presentation Layer 스킵
이유: API 엔드포인트가 필요하지 않습니다.
```

### 2단계: 기존 패턴 참조

구현 전 반드시 기존 모듈의 프레젠테이션 레이어를 참조하여 코드 스타일을 맞춥니다:

- `src/module/company-post/presentation/`
- `src/module/workplace/presentation/`
- `src/module/tbm-education/presentation/`

### 3단계: 파일 구조 생성

```
src/module/{module-name}/presentation/
├── controllers/
│   ├── {role}-{entity}.controller.ts
│   └── index.ts
├── dtos/
│   ├── request/
│   │   ├── create-{entity}.request.dto.ts
│   │   ├── update-{entity}.request.dto.ts
│   │   └── index.ts
│   ├── response/
│   │   ├── {entity}-detail.response.dto.ts
│   │   ├── {entity}-list.response.dto.ts
│   │   └── index.ts
│   └── index.ts
└── transformers/
    ├── {entity}.transformer.ts
    └── index.ts
```

### 4단계: 스크립트를 사용한 빠른 생성 (권장)

boilerplate 코드 생성을 위한 스크립트를 제공합니다. 스크립트 실행 후 TODO 주석을 확인하고 비즈니스 로직을 작성하세요.

#### Controller 생성

```bash
cd .claude/skills/presentation-layer
bash scripts/generate-controller.sh {module-name} {AggregateRootName} {role}
```

**role 종류**: `super-admin`, `company-admin`, `user`, `my`

예시:

```bash
bash scripts/generate-controller.sh instructor Instructor company-admin
bash scripts/generate-controller.sh instructor Instructor my
```

**상세 패턴이 필요하면**: `patterns/controller.md` 참조

#### Request DTO 생성

```bash
cd .claude/skills/presentation-layer
bash scripts/generate-request-dto.sh {module-name} {AggregateRootName} {action}
```

**action 종류**: `create`, `update`

예시:

```bash
bash scripts/generate-request-dto.sh instructor Instructor create
bash scripts/generate-request-dto.sh instructor Instructor update
```

**상세 패턴이 필요하면**: `patterns/request-dto.md` 참조

#### Response DTO 생성

```bash
cd .claude/skills/presentation-layer
bash scripts/generate-response-dto.sh {module-name} {AggregateRootName} {type}
```

**type 종류**: `detail`, `list`

예시:

```bash
bash scripts/generate-response-dto.sh instructor Instructor detail
bash scripts/generate-response-dto.sh instructor Instructor list
```

**상세 패턴이 필요하면**: `patterns/response-dto.md` 참조

#### Transformer 생성

```bash
cd .claude/skills/presentation-layer
bash scripts/generate-transformer.sh {module-name} {AggregateRootName}
```

예시:

```bash
bash scripts/generate-transformer.sh instructor Instructor
```

**상세 패턴이 필요하면**: `patterns/transformer.md` 참조

---

## 🎯 구현 워크플로우

### 권장 순서

#### Case 1: 전체 CRUD API 구현

1. **Response DTOs 생성** (스크립트 사용)
   → 필드 추가 및 수정

2. **Request DTOs 생성** (스크립트 사용)
   → Validation 데코레이터 추가

3. **Transformer 생성** (스크립트 사용)
   → QueryModel → Response DTO 매핑

4. **Controller 생성** (스크립트 사용)
   → UseCase 호출 및 Transformer 사용

---

## 🎯 실행 결과 출력

구현 완료 시:

```
✅ Presentation Layer 구현 완료

생성된 파일:
- presentation/controllers/{role}-{entity}.controller.ts
- presentation/controllers/index.ts
- presentation/dtos/request/create-{entity}.request.dto.ts
- presentation/dtos/request/update-{entity}.request.dto.ts
- presentation/dtos/request/index.ts
- presentation/dtos/response/{entity}-detail.response.dto.ts
- presentation/dtos/response/{entity}-list.response.dto.ts
- presentation/dtos/response/index.ts
- presentation/dtos/index.ts
- presentation/transformers/{entity}.transformer.ts
- presentation/transformers/index.ts

다음 단계: 모듈 파일 업데이트 및 통합 테스트
```

## ⚠️ 주의사항

1. **기존 코드 스타일 준수**: 반드시 company-post, workplace 모듈의 기존 패턴을 따릅니다
2. **Swagger 문서화**: 모든 엔드포인트에 `@ApiOperation()` 추가
3. **Validation**: Request DTO에 적절한 Validation 데코레이터 사용
4. **nullable 처리**: Response DTO에서 nullable 필드는 명시적으로 표시
5. **역할 기반 접근 제어**: `@UserAccess()` 데코레이터 사용
6. **한국어 설명**: ApiOperation의 description은 한국어로 작성

## 🚫 하지 말아야 할 것

- ❌ Controller에 비즈니스 로직 작성
- ❌ Request DTO에 `@ApiProperty()` 누락
- ❌ Response DTO에서 nullable 처리 누락
- ❌ Transformer 없이 직접 Response DTO 생성
- ❌ Swagger 문서화 누락
- ❌ Validation 데코레이터 누락

---

## 📚 상세 패턴 문서

필요할 때 다음 문서를 참조하세요:

- `patterns/controller.md`: Controller 작성 패턴
- `patterns/request-dto.md`: Request DTO 작성 패턴
- `patterns/response-dto.md`: Response DTO 작성 패턴
- `patterns/transformer.md`: Transformer 작성 패턴
