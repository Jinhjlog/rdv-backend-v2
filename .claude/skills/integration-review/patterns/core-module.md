# Core 모듈 등록 패턴

**파일명**: `src/module/{module-name}/{module-name}-core.module.ts`

**목적**: Domain과 Infrastructure 레이어의 Repository, Service를 등록하고 export

## 템플릿

```typescript
import { Module } from '@nestjs/common';
// 1. Repository 인터페이스 import (domain/repositories)
import {
  EntityRepository,
  EntityQueryRepository,
} from './domain/repositories';

// 2. Repository 구현체 import (infra/repositories)
import {
  EntityRepositoryImpl,
  EntityQueryRepositoryImpl,
} from './infra/repositories';

// 3. Domain Services import (domain/services)
import {
  EntityCreationService,
  EntityValidationService,
} from './domain/services';

// 4. Infra Services import (infra/services) - Mapper 제외
import {
  TranslationCacheService,
} from './infra/services';

@Module({
  imports: [
    // 외부 모듈이 필요한 경우 추가
    // TranslationModule,
  ],
  providers: [
    // Domain Services
    EntityCreationService,
    EntityValidationService,

    // Infra Services
    TranslationCacheService,

    // Repository 등록 (provide/useClass 패턴)
    {
      provide: EntityRepository,
      useClass: EntityRepositoryImpl,
    },
    {
      provide: EntityQueryRepository,
      useClass: EntityQueryRepositoryImpl,
    },
  ],
  exports: [
    // providers의 모든 것을 export
    EntityCreationService,
    EntityValidationService,
    TranslationCacheService,
    EntityRepository,
    EntityQueryRepository,
  ],
})
export class EntityCoreModule {}
```

## 작성 가이드

### 1. Repository 매핑 확인

- 인터페이스 파일명: `{name}.repository.ts`
- 구현체 파일명: `{name}.repository.impl.ts`
- 파일명이 일치하는지 확인

### 2. Domain Services 등록

- `domain/services/*.service.ts` 파일의 클래스명 확인
- export된 클래스를 import 및 providers에 추가

### 3. Infra Services 등록

- `infra/services/*.service.ts` 파일 확인
- **Mapper는 제외** (별도로 사용됨)
- TranslationCacheService 등 실제 서비스만 등록

### 4. 외부 모듈 의존성

- TranslationModule, UploadModule 등 필요한 경우 imports에 추가

## 실제 예시: instructor-core.module.ts

```typescript
import { Module } from '@nestjs/common';
import { InstructorRepository } from './domain/repositories';
import { InstructorRepositoryImpl } from './infra/repositories';
import { InstructorCreationService } from './domain/services';

@Module({
  imports: [],
  providers: [
    InstructorCreationService,
    {
      provide: InstructorRepository,
      useClass: InstructorRepositoryImpl,
    },
  ],
  exports: [
    InstructorCreationService,
    InstructorRepository,
  ],
})
export class InstructorCoreModule {}
```

## 주의사항

- ✅ providers와 exports를 일치시키기
- ✅ Repository는 provide/useClass 패턴 사용
- ❌ Mapper는 등록하지 않기 (별도 사용)
