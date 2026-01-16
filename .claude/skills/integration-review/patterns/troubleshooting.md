# 트러블슈팅 가이드

통합 과정에서 자주 발생하는 문제와 해결 방법입니다.

## Lint 관련 에러

### 1. Unused imports

**증상:**
```
error: 'EntityRepository' is defined but never used
```

**해결**: 사용하지 않는 import 제거

### 2. Missing imports

**증상:**
```
error: 'EntityRepository' is not defined
```

**해결**: 필요한 import 추가

### 3. 잘못된 경로

**증상:**
```
error: Cannot find module './domain/repositories'
```

**해결**:
- index.ts 파일 확인
- export 누락 여부 확인

---

## Build 관련 에러

### 1. 타입 에러

**증상:**
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'BoundedString'
```

**해결**: Value Object 사용 확인, `.value` 접근 누락 확인

### 2. Provider 누락

**증상:**
```
error: Nest can't resolve dependencies of the CreateEntityUseCase (?, EntityRepository)
```

**해결**:
- Core 모듈의 providers에 Repository 등록 확인
- 역할별 모듈의 imports에 CoreModule 포함 확인

### 3. Export 누락

**증상:**
```
error: EntityRepository is not exported from EntityCoreModule
```

**해결**: Core 모듈의 exports에 추가

### 4. 순환 참조 (Circular Dependency)

**증상:**
```
error: Circular dependency detected
```

**해결**: `forwardRef()` 사용 또는 의존성 구조 재설계

---

## 문제 1: Repository가 주입되지 않음

**증상:**
```
Error: Nest can't resolve dependencies of the CreateEntityUseCase (?, EntityRepository)
```

**원인:**
- Core 모듈의 providers에 Repository가 등록되지 않음
- 역할별 모듈의 imports에 CoreModule이 없음

**해결:**

1. Core 모듈 providers 확인:
   ```typescript
   providers: [
     {
       provide: EntityRepository,
       useClass: EntityRepositoryImpl,
     },
   ]
   ```

2. 역할별 모듈 imports 확인:
   ```typescript
   imports: [EntityCoreModule]
   ```

---

## 문제 2: Domain Service를 UseCase에서 사용할 수 없음

**증상:**
```
Error: Nest can't resolve dependencies of the CreateEntityUseCase (EntityRepository, ?)
```

**원인:**
- Core 모듈의 providers에 Domain Service가 등록되지 않음
- Core 모듈의 exports에 Domain Service가 없음

**해결:**

1. Core 모듈 providers에 추가:
   ```typescript
   providers: [
     EntityCreationService, // 추가
   ]
   ```

2. Core 모듈 exports에 추가:
   ```typescript
   exports: [
     EntityCreationService, // 추가
   ]
   ```

---

## 문제 3: Event Handler가 등록되지 않음

**증상:**
- Domain Event가 발행되지만 핸들러가 실행되지 않음

**원인:**
- Event Handler가 providers에 등록되지 않음

**해결:**

역할별 모듈의 providers에 Event Handler 추가:
```typescript
const eventHandlers: Provider[] = [
  EntityCreatedEventHandler,
];

@Module({
  providers: [
    ...useCases,
    ...eventHandlers, // 추가
  ],
})
```

---

## 문제 4: 순환 참조 에러

**증상:**
```
Error: Circular dependency detected
```

**원인:**
- 모듈 간 순환 참조 발생

**해결:**

1. `forwardRef()` 사용:
   ```typescript
   import { forwardRef } from '@nestjs/common';

   @Module({
     imports: [
       forwardRef(() => OtherModule),
     ],
   })
   ```

2. 의존성 구조 재설계:
   - 순환 참조가 발생하는 의존성을 공통 모듈로 분리

---

## 참고: NestJS Module 기본 개념

**imports**: 다른 모듈의 exports를 가져와서 사용
**providers**: 주입 가능한 Service, Repository 등 등록
**controllers**: REST API 엔드포인트 등록
**exports**: 이 모듈의 providers를 다른 모듈에서 사용 가능하도록 노출

## DDD 모듈 구조의 장점

1. **관심사의 분리**
   - Core 모듈: Domain + Infrastructure
   - 역할별 모듈: Application + Presentation

2. **재사용성**
   - Core 모듈을 여러 역할별 모듈에서 공유

3. **테스트 용이성**
   - 각 모듈을 독립적으로 테스트 가능

4. **확장성**
   - 새로운 역할 추가 시 역할별 모듈만 추가
