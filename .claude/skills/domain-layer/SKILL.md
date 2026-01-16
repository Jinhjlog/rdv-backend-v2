---
name: domain-layer
description: "**PROACTIVE SKILL - AUTO-INVOKE**: MUST be automatically invoked for ALL domain layer implementation tasks. Trigger keywords: 도메인 레이어, Entity 생성, Aggregate Root, Value Object, Repository 인터페이스, 도메인 모델, domain layer, create entity, implement domain. DO NOT manually implement domain code - ALWAYS use this skill instead."
allowed-tools: Read, Write, Glob, Grep, Bash
user-invocable: true
---

# Domain Layer 구현 스킬

## ⚠️ IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 즉시 이 스킬을 실행해야 합니다:**

### 자동 실행 트리거 (Auto-Invoke Triggers)

- "도메인 레이어 구현"
- "도메인 모델 만들어줘"
- "Entity 생성", "Entity 만들어줘"
- "Aggregate Root 생성"
- "Value Object 추가"
- "Repository 인터페이스 정의"
- "도메인 서비스 작성"
- "Domain Event 추가"
- "domain layer implementation"
- "create entity", "implement aggregate root"

**실행 방법:**
```typescript
// 사용자 요청 감지 시 즉시 다음을 호출
Skill({ skill: "domain-layer" })
```

**금지 사항:**
- ❌ Read, Write, Edit 툴로 직접 도메인 레이어 코드 작성
- ❌ 스킬 없이 수동으로 Entity/Value Object 구현
- ✅ 반드시 이 스킬을 통해서만 도메인 레이어 구현

---

DDD(Domain-Driven Design) 패턴에 따라 도메인 레이어를 구현합니다.

## 📋 실행 프로세스

### 1단계: 요구사항 분석

요구사항 문서를 읽고 다음을 판단합니다:

```markdown
# 판단 기준

- 새로운 Entity(Aggregate Root)가 필요한가?
- 새로운 Value Object가 필요한가?
- 새로운 Repository 메서드가 필요한가?
- Domain Service가 필요한가?
- Domain Event가 필요한가?
```

**⏭️ 스킵 조건**:

- 모든 항목이 "아니오"인 경우
- 기존 도메인 모델만 사용하는 경우

스킵 시 다음과 같이 출력:

```
⏭️ Domain Layer 스킵
이유: 기존 도메인 모델을 사용하며 새로운 엔티티나 Value Object가 필요하지 않습니다.
```

### 2단계: 기존 패턴 참조

구현 전 반드시 기존 모듈의 도메인 레이어를 참조하여 코드 스타일을 맞춥니다:

- `src/module/workplace/domain/`
- `src/module/user/domain/`
- `src/module/company/domain/`

### 3단계: 파일 구조 생성

```
src/module/{module-name}/domain/
├── models/
│   ├── {entity-name}/
│   │   ├── {entity-name}.ts                    # Aggregate Root
│   │   ├── {value-object-name}.ts              # Value Objects
│   │   └── {entity-name}.query-model.ts        # Query Model (optional)
│   └── index.ts
├── repositories/
│   ├── {entity-name}.repository.ts              # Repository Interface
│   └── index.ts
├── services/
│   ├── {service-name}.service.ts                # Domain Service
│   └── index.ts
└── events/
    ├── {event-name}.event.ts                    # Domain Event
    └── index.ts
```

### 4단계: 스크립트를 사용한 빠른 생성 (권장)

boilerplate 코드 생성을 위한 스크립트를 제공합니다. 스크립트 실행 후 TODO 주석을 확인하고 비즈니스 로직을 작성하세요.

#### Aggregate Root 생성

**Aggregate Root**: 독립적으로 관리되는 애그리게잇의 대표 엔티티

```bash
cd .claude/skills/domain-layer
bash scripts/generate-aggregate-root.sh {module-name} {AggregateRootName}
```

예시: `bash scripts/generate-aggregate-root.sh instructor Instructor`

**상세 패턴이 필요하면**: `patterns/aggregate-root.md` 참조

#### Entity 생성 (하위 엔티티)

**Entity**: Aggregate Root에 종속되는 하위 엔티티

```bash
cd .claude/skills/domain-layer
bash scripts/generate-entity.sh {module-name} {AggregateRootName} {EntityName}
```

예시: `bash scripts/generate-entity.sh company-post CompanyPost CompanyPostAttachment`

**⚠️ 중요**: Entity는 반드시 Aggregate Root에 종속되어야 함

**상세 패턴이 필요하면**: `patterns/entity.md` 참조

#### Value Object 생성

```bash
cd .claude/skills/domain-layer
bash scripts/generate-value-object.sh {module-name} {EntityName} {ValueObjectName}
```

예시: `bash scripts/generate-value-object.sh instructor Instructor InstructorCode`

**상세 패턴이 필요하면**: `patterns/value-object.md` 참조

#### Repository Interface 생성

```bash
cd .claude/skills/domain-layer
bash scripts/generate-repository.sh {module-name} {EntityName}
```

예시: `bash scripts/generate-repository.sh instructor Instructor`

**상세 패턴이 필요하면**: `patterns/repository.md` 참조

#### Domain Service 생성

```bash
cd .claude/skills/domain-layer
bash scripts/generate-domain-service.sh {module-name} {ServiceName}
```

예시: `bash scripts/generate-domain-service.sh instructor InstructorCreation`

**상세 패턴이 필요하면**: `patterns/domain-service.md` 참조

#### Domain Event 생성

```bash
cd .claude/skills/domain-layer
bash scripts/generate-domain-event.sh {module-name} {EventName}
```

예시: `bash scripts/generate-domain-event.sh instructor InstructorCreated`

**상세 패턴이 필요하면**: `patterns/domain-event.md` 참조

#### Query Model 생성 (선택)

**Query Model**: 복잡한 조회 결과를 표현하기 위한 모델 (primitive types만 사용)

```bash
cd .claude/skills/domain-layer
bash scripts/generate-query-model.sh {module-name} {AggregateRootName}
```

예시: `bash scripts/generate-query-model.sh company Company`

**상세 패턴이 필요하면**: `patterns/query-model.md` 참조

#### Query Repository Interface 생성 (선택)

**Query Repository**: 복잡한 조회 쿼리 전용 인터페이스

```bash
cd .claude/skills/domain-layer
bash scripts/generate-query-repository.sh {module-name} {AggregateRootName}
```

예시: `bash scripts/generate-query-repository.sh company Company`

**상세 패턴이 필요하면**: `patterns/query-repository.md` 참조

**💡 스크립트 사용 팁:**

- 스크립트는 기본 구조만 생성합니다
- 생성 후 TODO 주석을 확인하고 실제 비즈니스 로직을 작성하세요
- 모든 스크립트는 index.ts를 자동으로 업데이트합니다

---

## ⚠️ Aggregate Root vs Entity 구분

| 구분 | Aggregate Root | Entity (하위) |
|------|---------------|--------------|
| 정의 | 독립적으로 관리되는 대표 엔티티 | Aggregate Root에 종속되는 하위 엔티티 |
| 상속 | `AggregateRoot<Props>` | `EntityClass<Props>` |
| 독립성 | 독립적으로 존재 가능 | 부모 Aggregate 없이 존재 불가 |
| 필수 필드 | - | 부모 Aggregate ID |
| Repository | 직접 저장/조회 | 부모를 통해 접근 |
| Domain Event | 발행 가능 | 발행 불가 |
| 예시 | `Workplace`, `User`, `CompanyPost` | `CompanyPostAttachment`, `WorkplaceInspectionItem` |

---

## 🎯 구현 워크플로우

### 권장 순서

#### Case 1: 새로운 Aggregate Root 생성

1. **Aggregate Root 생성** (스크립트 사용)
   → Props 필드, Getter, 도메인 메서드 작성

2. **Value Objects 생성** (필요시, 스크립트 사용)
   → Validation 로직 작성

3. **Repository 생성** (스크립트 사용)
   → 필요한 메서드 추가

4. **Domain Service 생성** (필요시, 스크립트 사용)
   → 필요한 Repository 주입, 도메인 로직 메서드 작성

5. **Domain Event 생성** (필요시, 스크립트 사용)
   → Payload 정의, Aggregate Root에서 이벤트 발행

#### Case 2: 기존 Aggregate에 하위 Entity 추가

1. **Entity 생성** (스크립트 사용)
   → CreateProps/Props 필드, Getter, create() 메서드 작성

2. **Value Objects 생성** (필요시, 스크립트 사용)
   → Validation 로직 작성

3. **Aggregate Root 수정**
   - Entity를 관리하는 메서드 추가
   - 예: `addAttachment()`, `removeAttachment()`

---

## 🎯 실행 결과 출력

구현 완료 시:

```
✅ Domain Layer 구현 완료

생성된 파일:
- domain/models/{entity-name}/{entity-name}.ts
- domain/models/{entity-name}/{value-object}.ts
- domain/models/index.ts
- domain/repositories/{entity-name}.repository.ts
- domain/repositories/index.ts
- domain/services/{service-name}.service.ts (optional)
- domain/services/index.ts (optional)
- domain/events/{event-name}.event.ts (optional)
- domain/events/index.ts (optional)

다음 단계: Infrastructure Layer 구현
```

## ⚠️ 주의사항

1. **기존 코드 스타일 준수**: 반드시 workplace, user, company 모듈의 기존 패턴을 따릅니다
2. **Value Objects 우선**: 가능하면 `@lib/domain`의 Value Objects를 사용합니다
3. **불변성 유지**: Entity의 props는 도메인 메서드를 통해서만 수정합니다
4. **Validation 위치**: Value Objects와 Entity 생성 시 validation을 수행합니다
5. **Import 경로**: `@lib/domain`, `@shared/exception` 등 Path Alias를 사용합니다
6. **한국어 주석**: 모든 JSDoc과 에러 메시지는 한국어로 작성합니다

## 🚫 하지 말아야 할 것

- ❌ Prisma 타입을 도메인 레이어에서 직접 사용
- ❌ Repository에 구현 로직 포함 (인터페이스만)
- ❌ Entity에 public setter 추가
- ❌ Domain Service 없이 복잡한 생성 로직을 UseCase에 작성
- ❌ 기존 패턴과 다른 스타일로 작성

---

## 📚 상세 패턴 문서

필요할 때 다음 문서를 참조하세요:

- `patterns/aggregate-root.md`: Aggregate Root 작성 패턴
- `patterns/entity.md`: Entity (하위 엔티티) 작성 패턴
- `patterns/value-object.md`: Value Object 작성 패턴
- `patterns/repository.md`: Repository 작성 패턴
- `patterns/query-model.md`: Query Model 작성 패턴
- `patterns/query-repository.md`: Query Repository 작성 패턴
- `patterns/domain-service.md`: Domain Service 작성 패턴
- `patterns/domain-event.md`: Domain Event 작성 패턴
