---
name: infrastructure-layer
description: "**PROACTIVE SKILL - AUTO-INVOKE**: MUST be automatically invoked for ALL infrastructure layer implementation tasks. Trigger keywords: 인프라 레이어, Repository 구현, Mapper 작성, Query Repository, infrastructure layer, implement repository. DO NOT manually implement infrastructure code - ALWAYS use this skill instead."
allowed-tools: Read, Write, Glob, Grep, Bash
user-invocable: true
---

# Infrastructure Layer 구현 스킬

## ⚠️ IMPORTANT: Claude 자동 실행 지시사항

**Claude는 사용자가 다음과 같은 요청을 하면 즉시 이 스킬을 실행해야 합니다:**

### 자동 실행 트리거 (Auto-Invoke Triggers)

- "인프라 레이어 구현"
- "인프라스트럭처 레이어 작성"
- "Repository 구현", "Repository 구현체 만들어줘"
- "Mapper 작성", "Mapper 추가"
- "Query Repository 구현"
- "infrastructure layer implementation"
- "implement repository", "create mapper"

**실행 방법:**
```typescript
// 사용자 요청 감지 시 즉시 다음을 호출
Skill({ skill: "infrastructure-layer" })
```

**금지 사항:**
- ❌ Read, Write, Edit 툴로 직접 인프라 레이어 코드 작성
- ❌ 스킬 없이 수동으로 Repository/Mapper 구현
- ✅ 반드시 이 스킬을 통해서만 인프라 레이어 구현

---

DDD(Domain-Driven Design) 패턴에 따라 인프라스트럭처 레이어를 구현합니다.

## 📋 실행 프로세스

### 1단계: 요구사항 분석

요구사항 문서를 읽고 다음을 판단합니다:

```markdown
# 판단 기준

- Domain Repository 인터페이스가 있는가?
- Mapper가 필요한가?
- Query Repository가 필요한가? (복잡한 조회 쿼리)
```

**⏭️ 스킵 조건**:

- Domain Repository 인터페이스가 없는 경우
- 단순 조회만으로 충분한 경우

스킵 시 다음과 같이 출력:

```
⏭️ Infrastructure Layer 스킵
이유: Domain Repository 인터페이스가 없거나 구현할 내용이 없습니다.
```

### 2단계: 기존 패턴 참조

구현 전 반드시 기존 모듈의 인프라 레이어를 참조하여 코드 스타일을 맞춥니다:

- `src/module/company-post/infra/`
- `src/module/tbm-education/infra/`
- `src/module/company/infra/`

### 3단계: 파일 구조 생성

```
src/module/{module-name}/infra/
├── repositories/
│   ├── {entity}.repository.impl.ts      # Repository 구현체
│   ├── {entity}-query.repository.impl.ts # Query Repository (optional)
│   └── index.ts
└── mappers/
    ├── {entity}.mapper.ts                # Mapper
    ├── {entity}-attachment.mapper.ts     # 하위 Entity Mapper (optional)
    └── index.ts
```

### 4단계: 스크립트를 사용한 빠른 생성 (권장)

boilerplate 코드 생성을 위한 스크립트를 제공합니다. 스크립트 실행 후 TODO 주석을 확인하고 비즈니스 로직을 작성하세요.

#### Mapper 생성 (먼저 수행)

```bash
cd .claude/skills/infrastructure-layer
bash scripts/generate-mapper.sh {module-name} {AggregateRootName}
```

예시: `bash scripts/generate-mapper.sh anonymous-post AnonymousPost`

**상세 패턴이 필요하면**: `patterns/mapper.md` 참조

#### Repository 구현체 생성

```bash
cd .claude/skills/infrastructure-layer
bash scripts/generate-repository-impl.sh {module-name} {AggregateRootName}
```

예시: `bash scripts/generate-repository-impl.sh anonymous-post AnonymousPost`

생성되는 것:
- `@Injectable()` 데코레이터
- PrismaService 주입
- 기본 메서드 (`save`, `findById`)
- Domain Events 발행 로직

**상세 패턴이 필요하면**: `patterns/repository-impl.md` 참조

#### 하위 Entity Mapper 생성 (선택)

```bash
cd .claude/skills/infrastructure-layer
bash scripts/generate-mapper.sh {module-name} {AggregateRootName} {EntityName}
```

예시: `bash scripts/generate-mapper.sh company-post CompanyPost CompanyPostAttachment`

**상세 패턴이 필요하면**: `patterns/mapper.md` 참조

#### Query Repository 구현체 생성 (선택)

```bash
cd .claude/skills/infrastructure-layer
bash scripts/generate-query-repository-impl.sh {module-name} {AggregateRootName}
```

예시: `bash scripts/generate-query-repository-impl.sh company Company`

복잡한 조회 쿼리용 ($queryRaw, findMany 등)

**상세 패턴이 필요하면**: `patterns/query-repository-impl.md` 참조

---

## 🎯 구현 워크플로우

### 권장 순서

#### Case 1: 새로운 Aggregate Root용 Infrastructure 생성

1. **Mapper 생성** (스크립트 사용)
   → Value Objects 필드 매핑 완료

2. **Repository 구현체 생성** (스크립트 사용)
   → save/findById 메서드 구현

3. **하위 Entity Mapper 생성** (필요시, 스크립트 사용)
   → 하위 엔티티 매핑

4. **Query Repository 생성** (필요시, 스크립트 사용)
   → 복잡한 조회 쿼리

#### Case 2: 기존 Infrastructure에 Query Repository 추가

1. **Query Repository 생성** (스크립트 사용)
   → 복잡한 조회 쿼리 작성

---

## 🎯 실행 결과 출력

구현 완료 시:

```
✅ Infrastructure Layer 구현 완료

생성된 파일:
- infra/repositories/{entity}.repository.impl.ts
- infra/repositories/index.ts
- infra/mappers/{entity}.mapper.ts
- infra/mappers/index.ts

다음 단계: Application Layer 구현
```

## ⚠️ 주의사항

1. **기존 코드 스타일 준수**: 반드시 company-post, tbm-education 모듈의 기존 패턴을 따릅니다
2. **Value Objects 처리**: `toDomain()`에서는 `unsafeCreate()` 사용
3. **트랜잭션 처리**: Aggregate 저장은 `$transaction`으로
4. **Domain Events 발행**: 저장 후 `DomainEvents.dispatchEventsForAggregate()` 호출
5. **관계 연결**: Prisma `connect` 사용
6. **한국어 주석**: 모든 JSDoc과 주석은 한국어로 작성

## 🚫 하지 말아야 할 것

- ❌ 도메인 레이어에서 Prisma 타입 직접 사용
- ❌ Mapper에서 비즈니스 로직 포함
- ❌ Query Repository에서 write 작업
- ❌ Domain Events 발행 누락
- ❌ 트랜잭션 없이 하위 엔티티 저장

---

## 📚 상세 패턴 문서

필요할 때 다음 문서를 참조하세요:

- `patterns/repository-impl.md`: Repository 구현체 작성 패턴
- `patterns/mapper.md`: Mapper 작성 패턴 (Aggregate Root + 하위 Entity)
- `patterns/query-repository-impl.md`: Query Repository 구현체 작성 패턴
