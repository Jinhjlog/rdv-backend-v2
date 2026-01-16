---
name: generate-feature
description: "DDD 전체 레이어 자동 생성 오케스트레이터. 요구사항 문서를 입력받아 Domain → Infrastructure → Application → Presentation → Integration 순서로 자동 구현. \"기능 생성\", \"전체 구현\", \"generate feature\" 키워드 사용 시 실행."
allowed-tools: Read, Write, Glob, Grep
user-invocable: true
---

# 전체 DDD 레이어 자동 생성 오케스트레이터

## ⚠️ IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 이 스킬 사용을 고려해야 합니다:**

### 실행 트리거 (Invoke Triggers)

- "기능 생성", "전체 기능 구현"
- "전체 레이어 생성", "모든 레이어 구현"
- "요구사항 문서로 자동 생성"
- "generate feature", "implement all layers"
- "create full feature"

**실행 방법:**
```typescript
// 요구사항 문서 경로와 함께 호출
Skill({ skill: "generate-feature", args: "docs/requirements/feature.md" })
```

**이 스킬의 역할:**
- ✅ domain-layer 스킬 자동 호출
- ✅ infrastructure-layer 스킬 자동 호출
- ✅ application-layer 스킬 자동 호출
- ✅ presentation-layer 스킬 자동 호출
- ✅ integration-review 스킬 자동 호출

**권장 사항:**
- ✅ 완전히 새로운 기능을 처음부터 끝까지 구현할 때 사용
- ✅ 요구사항 문서가 있을 때 가장 효과적

---

요구사항 문서를 기반으로 DDD Clean Architecture의 전체 레이어를 순차적으로 자동 생성합니다.

## 🎯 목표

하나의 요구사항 문서(마크다운)를 입력받아 다음 순서로 레이어별 코드를 자동 생성:

```
Domain Layer → Infrastructure Layer → Application Layer → Presentation Layer → Integration & Review
```

각 레이어는 구현할 내용이 없으면 자동으로 스킵합니다.

## 📋 실행 프로세스

### 사전 준비

1. **요구사항 문서 작성**

요구사항 문서는 다음 형식으로 작성되어야 합니다:

```markdown
# 기능 요구사항: {기능명}

## 비즈니스 요구사항

- 목표 및 기능 설명
- 주요 유즈케이스

## 도메인 모델

### Entity: {EntityName}

- 필드명: 타입, 설명, 제약사항
- 관계: 다른 엔티티와의 관계

### Value Objects

- {VOName}: 설명, 유효성 규칙

## Repository 메서드

- save()
- findById()
- 기타 필요한 메서드

## API 엔드포인트

### POST /{entity}

- 설명: {Entity} 생성
- 권한: CompanyAdmin
- Request Body: ...
- Response: ...

### GET /{entity}/:id

- 설명: {Entity} 상세 조회
- 권한: ...
```

2. **요구사항 문서 위치 확인**

문서는 프로젝트 루트 기준으로 경로를 지정합니다:

- `docs/requirements/{feature-name}.md`
- `requirements/{feature-name}.md`
- 또는 사용자 지정 경로

### 1단계: 요구사항 문서 읽기 및 분석

사용자가 제공한 요구사항 문서 경로를 읽고 다음을 분석합니다:

**분석 항목:**

- 모듈명 (module-name)
- 주요 Entity/Aggregate Root
- Value Objects
- Repository 메서드
- Domain Services 필요 여부
- Domain Events 필요 여부
- UseCase 목록
- API 엔드포인트 목록
- 권한 (Role) 정보

**출력 예시:**

```
📄 요구사항 분석 완료

모듈명: instructor
주요 Entity: Instructor
Value Objects: InstructorCode, InstructorName
Repository: InstructorRepository
Domain Service: InstructorCreationService
UseCase: CreateInstructor, FindInstructorDetail, FindInstructorList
API: POST /instructors (company-admin), GET /instructors/:id (company-admin)
```

### 2단계: Domain Layer 구현

**스킬 호출:**

```
/domain-layer
```

**구현 내용:**

- Aggregate Root 생성
- Value Objects 생성
- Repository 인터페이스 정의
- Domain Services 작성
- Domain Events 정의
- Query Model 정의
- Query Repository 인터페이스 정의

**스킵 조건:**

- 새로운 Entity나 Value Object가 필요 없는 경우
- 기존 도메인 모델만 사용하는 경우

**다음 단계로 진행 조건:**

- Domain Layer 구현 완료
- 또는 Domain Layer 스킵

### 3단계: Infrastructure Layer 구현

**스킬 호출:**

```
/infrastructure-layer
```

**구현 내용:**

- Repository 구현체 생성
- Mapper 작성 (Domain ↔ Prisma)
- Query Repository 구현체 생성

**스킵 조건:**

- 새로운 Repository가 필요 없는 경우
- 기존 Repository만 사용하는 경우

**다음 단계로 진행 조건:**

- Infrastructure Layer 구현 완료
- 또는 Infrastructure Layer 스킵

### 4단계: Application Layer 구현

**스킬 호출:**

```
/application-layer
```

**구현 내용:**

- UseCase 생성 (Create, Find, Update, Delete, Custom)
- Application DTOs 정의
- Event Handler 작성

**스킵 조건:**

- 새로운 UseCase가 필요 없는 경우
- 기존 UseCase만 사용하는 경우

**다음 단계로 진행 조건:**

- Application Layer 구현 완료
- 또는 Application Layer 스킵

### 5단계: Presentation Layer 구현

**스킬 호출:**

```
/presentation-layer
```

**구현 내용:**

- Controller 생성 (역할별)
- Request DTOs 정의
- Response DTOs 정의
- Transformer 작성

**스킵 조건:**

- 새로운 API 엔드포인트가 필요 없는 경우

**다음 단계로 진행 조건:**

- Presentation Layer 구현 완료
- 또는 Presentation Layer 스킵

### 6단계: Integration & Review

**스킬 호출:**

```
/integration-review
```

**구현 내용:**

- 생성된 파일 확인
- Core 모듈 등록 가이드 제공
- 역할별 모듈 등록 가이드 제공
- Lint 검증 실행
- Build 검증 실행

**필수 단계:**
이 단계는 스킵할 수 없으며, 반드시 실행되어야 합니다.

**완료 조건:**

- `npm run lint` 통과
- `npm run build` 통과

## 🔄 실행 플로우

```mermaid
graph TD
    A[사용자: 요구사항 문서 경로 제공] --> B[요구사항 분석]
    B --> C{Domain 필요?}
    C -->|Yes| D[/domain-layer 실행]
    C -->|No| E[Domain 스킵]
    D --> F{Infrastructure 필요?}
    E --> F
    F -->|Yes| G[/infrastructure-layer 실행]
    F -->|No| H[Infrastructure 스킵]
    G --> I{Application 필요?}
    H --> I
    I -->|Yes| J[/application-layer 실행]
    I -->|No| K[Application 스킵]
    J --> L{Presentation 필요?}
    K --> L
    L -->|Yes| M[/presentation-layer 실행]
    L -->|No| N[Presentation 스킵]
    M --> O[/integration-review 실행]
    N --> O
    O --> P{Lint/Build 통과?}
    P -->|Yes| Q[✅ 완료]
    P -->|No| R[에러 수정 필요]
    R --> O
```

## 📝 사용 예시

### 예시 1: 전체 레이어 생성

```
사용자: 기능 생성 시작해줘. 요구사항 문서는 docs/requirements/instructor.md야.
```

**실행 순서:**

1. `docs/requirements/instructor.md` 읽기 및 분석
2. `/domain-layer` 실행 → Instructor 엔티티 생성
3. `/infrastructure-layer` 실행 → Repository 구현체 생성
4. `/application-layer` 실행 → CreateInstructor UseCase 생성
5. `/presentation-layer` 실행 → CompanyAdminInstructorController 생성
6. `/integration-review` 실행 → 모듈 등록 및 빌드 검증

### 예시 2: 일부 레이어만 생성

```
사용자: 기능 생성 시작해줘. 요구사항 문서는 requirements/notification.md야.
```

**분석 결과:**

- Domain: 기존 User 엔티티 사용 → 스킵
- Infrastructure: 기존 UserRepository 사용 → 스킵
- Application: SendNotificationUseCase 생성 필요 → 실행
- Presentation: 엔드포인트 없음 (백그라운드 작업) → 스킵

**실행 순서:**

1. `requirements/notification.md` 읽기 및 분석
2. Domain Layer 스킵
3. Infrastructure Layer 스킵
4. `/application-layer` 실행 → SendNotificationUseCase 생성
5. Presentation Layer 스킵
6. `/integration-review` 실행 → 모듈 등록 및 빌드 검증

## ✅ 최종 체크리스트

각 단계 완료 후 다음을 확인합니다:

### Domain Layer

- [ ] Aggregate Root 생성됨
- [ ] Value Objects 생성됨
- [ ] Repository 인터페이스 정의됨
- [ ] Domain Services 작성됨 (필요 시)
- [ ] Domain Events 정의됨 (필요 시)

### Infrastructure Layer

- [ ] Repository 구현체 생성됨
- [ ] Mapper 작성됨
- [ ] Query Repository 구현체 생성됨 (필요 시)

### Application Layer

- [ ] UseCase 생성됨
- [ ] Application DTOs 정의됨
- [ ] Event Handler 작성됨 (필요 시)

### Presentation Layer

- [ ] Controller 생성됨 (역할별)
- [ ] Request DTOs 정의됨
- [ ] Response DTOs 정의됨
- [ ] Transformer 작성됨

### Integration & Review

- [ ] Core 모듈 등록 완료
- [ ] 역할별 모듈 등록 완료
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과

## 🚨 에러 처리

### 에러 1: 요구사항 문서를 찾을 수 없음

```
❌ 요구사항 문서를 찾을 수 없습니다: docs/requirements/instructor.md

해결:
1. 파일 경로가 정확한지 확인하세요
2. 파일이 존재하는지 확인하세요
3. 프로젝트 루트 기준 상대 경로를 사용하세요
```

### 에러 2: Domain Layer 실행 실패

```
❌ Domain Layer 구현 중 에러가 발생했습니다.

해결:
1. 요구사항 문서에 도메인 모델 정보가 충분한지 확인
2. 기존 도메인 모델과 충돌이 없는지 확인
3. /domain-layer 스킬을 직접 실행하여 상세 에러 확인
```

### 에러 3: Lint 또는 Build 실패

```
❌ Lint 검증에 실패했습니다.

해결:
1. npm run lint 출력을 확인하여 에러 위치 파악
2. 생성된 코드에서 import 누락 확인
3. 타입 에러 수정
4. 수정 후 다시 /integration-review 실행
```

### 에러 4: 스킬 호출 권한 없음

```
❌ 스킬 호출 권한이 없습니다: /domain-layer

해결:
1. .claude/settings.local.json에 스킬 권한 추가:
   {
     "permissions": {
       "allow": [
         "Skill(domain-layer)",
         "Skill(infrastructure-layer)",
         "Skill(application-layer)",
         "Skill(presentation-layer)",
         "Skill(integration-review)"
       ]
     }
   }
2. Claude Code 재시작
```

## 🎨 진행 상황 추적

이 스킬은 진행 상황을 다음과 같이 표시합니다:

```
🚀 전체 DDD 레이어 자동 생성 시작

📄 요구사항 분석 완료
모듈명: instructor

1️⃣ Domain Layer 구현 중...
   ✅ Domain Layer 구현 완료

2️⃣ Infrastructure Layer 구현 중...
   ✅ Infrastructure Layer 구현 완료

3️⃣ Application Layer 구현 중...
   ✅ Application Layer 구현 완료

4️⃣ Presentation Layer 구현 중...
   ✅ Presentation Layer 구현 완료

5️⃣ Integration & Review 실행 중...
   ✅ Lint 통과
   ✅ Build 통과

🎉 전체 레이어 구현 완료!
```

## 💡 팁

### 1. 요구사항 문서 품질이 중요합니다

명확하고 상세한 요구사항 문서를 작성할수록 더 정확한 코드가 생성됩니다:

✅ **좋은 예:**

```markdown
### Entity: Instructor

- id: UUID, 강사 고유 식별자
- code: InstructorCode (Value Object), 강사 코드 (3-20자, 영문+숫자)
- name: InstructorName (Value Object), 강사 이름 (1-100자)
- email: Email, 이메일 주소
- status: InstructorStatus (Enum), 상태 (ACTIVE, INACTIVE)
```

❌ **나쁜 예:**

```markdown
### Entity: Instructor

- 강사 정보를 저장함
```

### 2. 단계별로 확인하세요

각 레이어 구현 후 생성된 파일을 확인하고, 필요하면 수정할 수 있습니다:

- Domain Layer 완료 후 → 엔티티 구조 확인
- Infrastructure Layer 완료 후 → Mapper 검증
- Application Layer 완료 후 → UseCase 로직 검토
- Presentation Layer 완료 후 → API 스펙 확인

### 3. 점진적 개선

첫 실행에서 완벽할 필요는 없습니다:

1. 기본 구조 생성
2. TODO 주석 확인 및 비즈니스 로직 작성
3. Lint/Build 에러 수정
4. 리팩토링 및 최적화

### 4. 기존 패턴 참조

생성된 코드는 기존 모듈의 패턴을 따릅니다:

- `src/module/workplace/`
- `src/module/user/`
- `src/module/company/`
- `src/module/company-post/`
- `src/module/tbm-education/`

프로젝트 일관성을 유지하기 위해 이 모듈들의 구조를 참고합니다.

## 🔗 관련 스킬

이 오케스트레이터는 다음 스킬들을 순차적으로 호출합니다:

1. **domain-layer**: 도메인 레이어 구현
2. **infrastructure-layer**: 인프라 레이어 구현
3. **application-layer**: 애플리케이션 레이어 구현
4. **presentation-layer**: 프레젠테이션 레이어 구현
5. **integration-review**: 통합 검토 및 빌드 검증

각 스킬은 독립적으로도 실행 가능하므로, 특정 레이어만 다시 생성하고 싶다면 해당 스킬을 직접 호출할 수 있습니다.

## 📚 참고 자료

### 프로젝트 구조 (DDD)

```
src/module/{module-name}/
├── domain/              # 비즈니스 로직
│   ├── models/          # Entity, Value Objects
│   ├── repositories/    # Repository 인터페이스
│   ├── services/        # Domain Services
│   └── events/          # Domain Events
├── application/         # 유즈케이스
│   ├── usecases/
│   └── dtos/
├── infra/              # 인프라 구현
│   ├── repositories/    # Repository 구현
│   └── mappers/         # Mapper
├── presentation/        # API 레이어
│   ├── controllers/
│   ├── dtos/
│   └── transformers/
└── *.module.ts         # NestJS 모듈
```

### 기술 스택

- **Framework**: NestJS
- **ORM**: Prisma + PostgreSQL (Supabase)
- **Architecture**: DDD + Clean Architecture
- **Language**: TypeScript

### Path Aliases

```typescript
"@lib/*": ["src/lib/*"]                           # Domain foundation
"@shared/*": ["src/shared/*"]                     # Shared utilities
"@prisma/generated/*": ["../prisma/generated/prisma/*"]
```

---

**작성일**: 2026-01-14
**버전**: 1.0.0
