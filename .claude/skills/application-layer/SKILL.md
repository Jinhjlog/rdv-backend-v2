---
name: application-layer
description: "DDD 애플리케이션 레이어 구현. UseCases, Application DTOs, Event Handlers를 생성. \"애플리케이션 레이어 구현\" 또는 \"application layer\" 키워드 사용 시 실행."
allowed-tools: Read, Write, Glob, Grep, Bash
user-invocable: true
---

# Application Layer 구현 스킬

## ⚠️ IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 이 스킬 사용을 고려해야 합니다:**

### 실행 트리거 (Invoke Triggers)

- "애플리케이션 레이어 구현"
- "Use Case 만들어줘", "UseCase 생성"
- "Application DTO 작성"
- "Event Handler 추가"
- "application layer implementation"
- "create usecase", "implement use case"

**실행 방법:**
```typescript
// 사용자 요청 감지 시 다음을 호출
Skill({ skill: "application-layer" })
```

**권장 사항:**
- ✅ 복잡한 UseCase 로직이 있을 때 이 스킬 사용 권장
- ✅ 여러 UseCase를 한 번에 생성할 때 이 스킬 사용
- ⚠️ 간단한 UseCase는 직접 구현도 가능

---

DDD(Domain-Driven Design) 패턴에 따라 애플리케이션 레이어를 구현합니다.

## 📋 실행 프로세스

### 1단계: 요구사항 분석

요구사항 문서를 읽고 다음을 판단합니다:

```markdown
# 판단 기준

- 어떤 비즈니스 유즈케이스가 필요한가?
  - Create (생성)
  - Find (조회 - 목록/상세)
  - Update (수정)
  - Delete (삭제)
  - Publish/Archive 등 상태 변경
- Application DTOs가 필요한가?
- Domain Event Handler가 필요한가?
```

**⏭️ 스킵 조건**:

- 도메인 레이어나 인프라 레이어가 없는 경우
- UseCase가 필요하지 않은 단순 조회만 있는 경우

스킵 시 다음과 같이 출력:

```
⏭️ Application Layer 스킵
이유: 구현할 UseCase가 없습니다.
```

### 2단계: 기존 패턴 참조

구현 전 반드시 기존 모듈의 애플리케이션 레이어를 참조하여 코드 스타일을 맞춥니다:

- `src/module/company-post/application/`
- `src/module/tbm-education/application/`
- `src/module/push-notification/application/`

### 3단계: 파일 구조 생성

```
src/module/{module-name}/application/
├── dtos/
│   ├── create-{entity}.dto.ts           # 생성용 DTO
│   ├── update-{entity}.dto.ts           # 수정용 DTO
│   ├── find-{entity}-list.dto.ts        # 목록 조회용 DTO
│   └── index.ts
├── usecases/
│   ├── create-{entity}.usecase.ts       # 생성 UseCase
│   ├── find-{entity}-detail.usecase.ts  # 상세 조회 UseCase
│   ├── find-{entity}-list.usecase.ts    # 목록 조회 UseCase
│   ├── update-{entity}.usecase.ts       # 수정 UseCase
│   ├── delete-{entity}.usecase.ts       # 삭제 UseCase
│   └── index.ts
└── handlers/ (optional)
    ├── {event-name}.handler.ts          # Event Handler
    └── index.ts
```

### 4단계: 스크립트를 사용한 빠른 생성 (권장)

boilerplate 코드 생성을 위한 스크립트를 제공합니다. 스크립트 실행 후 TODO 주석을 확인하고 비즈니스 로직을 작성하세요.

#### Application DTO 생성 (먼저 수행)

```bash
cd .claude/skills/application-layer
bash scripts/generate-application-dto.sh {module-name} {AggregateRootName} {action}
```

**action 종류**: `create`, `update`, `find-list`, `custom:{ActionName}`

예시:

```bash
bash scripts/generate-application-dto.sh instructor Instructor create
bash scripts/generate-application-dto.sh instructor Instructor update
bash scripts/generate-application-dto.sh instructor Instructor find-list
```

**상세 패턴이 필요하면**: `patterns/application-dto.md` 참조

#### UseCase 생성

```bash
cd .claude/skills/application-layer
bash scripts/generate-usecase.sh {module-name} {AggregateRootName} {action}
```

**action 종류**:
- `create` - 생성
- `find-detail` - 상세 조회
- `find-list` - 목록 조회
- `update` - 수정
- `delete` - 삭제
- `custom:{ActionName}` - 커스텀 액션 (예: `custom:Publish`, `custom:Archive`)

예시:

```bash
bash scripts/generate-usecase.sh instructor Instructor create
bash scripts/generate-usecase.sh instructor Instructor find-detail
bash scripts/generate-usecase.sh instructor Instructor find-list
bash scripts/generate-usecase.sh instructor Instructor update
bash scripts/generate-usecase.sh instructor Instructor custom:Approve
```

생성되는 것:
- `@Injectable()` 데코레이터
- Repository 주입
- `execute(dto)` 메서드 기본 구조
- index.ts 자동 업데이트

**상세 패턴이 필요하면**: `patterns/usecase.md` 참조

#### Event Handler 생성 (선택)

```bash
cd .claude/skills/application-layer
bash scripts/generate-event-handler.sh {module-name} {EventName}
```

예시: `bash scripts/generate-event-handler.sh instructor InstructorCreated`

생성되는 것:
- `@Injectable()` + `OnModuleInit` 인터페이스
- `onModuleInit()` 메서드
- `handle(event)` 메서드
- index.ts 자동 업데이트

**상세 패턴이 필요하면**: `patterns/event-handler.md` 참조

---

## 🎯 구현 워크플로우

### 권장 순서

#### Case 1: CRUD UseCase 구현

1. **Application DTOs 생성** (스크립트 사용)
   → 필요한 필드 추가

2. **Create UseCase 생성** (스크립트 사용)
   → Value Objects 생성, 엔티티 생성, 저장 로직 작성

3. **Find UseCases 생성** (스크립트 사용)
   → Query Repository 호출, 예외 처리

4. **Update UseCase 생성** (스크립트 사용)
   → 도메인 메서드 호출

5. **Delete UseCase 생성** (스크립트 사용)
   → Repository.delete() 호출

#### Case 2: Event Handler 추가

1. **Event Handler 생성** (스크립트 사용)
   → 이벤트 처리 로직 작성

2. **필요한 UseCase 주입**
   → 부수 효과 처리

---

## 🎯 실행 결과 출력

구현 완료 시:

```
✅ Application Layer 구현 완료

생성된 파일:
- application/dtos/create-{entity}.dto.ts
- application/dtos/update-{entity}.dto.ts
- application/dtos/find-{entity}-list.dto.ts
- application/dtos/index.ts
- application/usecases/create-{entity}.usecase.ts
- application/usecases/find-{entity}-detail.usecase.ts
- application/usecases/find-{entity}-list.usecase.ts
- application/usecases/update-{entity}.usecase.ts
- application/usecases/delete-{entity}.usecase.ts
- application/usecases/index.ts

다음 단계: Presentation Layer 구현
```

## ⚠️ 주의사항

1. **기존 코드 스타일 준수**: 반드시 company-post, tbm-education 모듈의 기존 패턴을 따릅니다
2. **Value Objects 생성**: UseCase에서 `BoundedString.create()` 사용
3. **예외 처리**: 엔티티 없을 때 `EntityNotFoundException` 발생
4. **Query Repository 사용**: 조회는 QueryModel 반환
5. **도메인 메서드 호출**: 수정 시 도메인 메서드 사용 (직접 props 수정 ❌)
6. **한국어 주석**: 모든 주석은 한국어로 작성

## 🚫 하지 말아야 할 것

- ❌ UseCase에 비즈니스 로직 직접 작성 (도메인 레이어에 작성)
- ❌ Application DTO에 Value Objects 사용
- ❌ 조회 UseCase에서 도메인 엔티티 반환
- ❌ props 직접 수정 (도메인 메서드 사용)
- ❌ Presentation Layer 의존성 (Controller, Request DTO 등)

---

## 📚 상세 패턴 문서

필요할 때 다음 문서를 참조하세요:

- `patterns/usecase.md`: UseCase 작성 패턴 (Create, Find, Update, Delete)
- `patterns/application-dto.md`: Application DTO 작성 패턴
- `patterns/event-handler.md`: Event Handler 작성 패턴
