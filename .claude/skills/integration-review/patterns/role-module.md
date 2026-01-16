# 역할별 모듈 등록 패턴

**파일명 패턴**:
- `super-admin-{entity}.module.ts`
- `company-admin-{entity}.module.ts`
- `user-{entity}.module.ts`

**목적**: Application과 Presentation 레이어의 UseCase, Controller를 등록

## 템플릿

```typescript
import { Module, Provider } from '@nestjs/common';
// 1. Core Module import (필수)
import { EntityCoreModule } from './{entity}-core.module';

// 2. UseCases import
import {
  CreateEntityUseCase,
  FindEntityDetailUseCase,
  FindEntityListUseCase,
  UpdateEntityUseCase,
  DeleteEntityUseCase,
} from './application/usecases';

// 3. Controllers import (역할별)
import {
  CompanyAdminEntityController,
} from './presentation/controllers';

// 4. Event Handlers import (있는 경우)
import {
  EntityCreatedEventHandler,
} from './application/event-handlers';

// UseCases 배열
const useCases: Provider[] = [
  CreateEntityUseCase,
  FindEntityDetailUseCase,
  FindEntityListUseCase,
  UpdateEntityUseCase,
  DeleteEntityUseCase,
];

// Event Handlers 배열 (있는 경우)
const eventHandlers: Provider[] = [
  EntityCreatedEventHandler,
];

@Module({
  imports: [
    EntityCoreModule, // Core 모듈은 필수
    // UploadModule, // 필요한 외부 모듈 추가
  ],
  controllers: [
    CompanyAdminEntityController,
  ],
  providers: [
    ...useCases,
    ...eventHandlers, // 있는 경우만
  ],
})
export class CompanyAdminEntityModule {}
```

## 역할별 가이드

### 1. super-admin 역할

- 파일명: `super-admin-{entity}.module.ts`
- Controller: `SuperAdmin{Entity}Controller`
- 경로: `admin/{entities}` (일반적)

### 2. company-admin 역할

- 파일명: `company-admin-{entity}.module.ts`
- Controller: `CompanyAdmin{Entity}Controller`
- 경로: `company-admin/{entities}` (일반적)

### 3. user 역할

- 파일명: `user-{entity}.module.ts`
- Controller: `User{Entity}Controller`, `My{Entity}Controller` (둘 다 가능)
- 경로: `{entities}` 또는 `me/{entities}`
- **주의**: user 모듈에 My 컨트롤러도 함께 포함할 수 있음

## 작성 가이드

### 1. UseCases 스캔

```bash
ls src/module/{module-name}/application/usecases/*.usecase.ts
```

- 각 파일의 export된 클래스명 확인
- useCases 배열에 추가

### 2. Controllers 스캔

```bash
ls src/module/{module-name}/presentation/controllers/*-{entity}.controller.ts
```

- 역할에 맞는 컨트롤러 파일 확인
- My 컨트롤러가 있으면 user 모듈에 포함

### 3. Event Handlers 스캔 (있는 경우)

```bash
ls src/module/{module-name}/application/event-handlers/*.event-handler.ts
```

- 이벤트 핸들러가 있으면 eventHandlers 배열 추가

### 4. 외부 모듈 의존성

- UploadModule: 파일 업로드 기능이 있는 경우
- 다른 모듈: UseCase에서 사용하는 경우

## 실제 예시: company-admin-instructor.module.ts

```typescript
import { Module, Provider } from '@nestjs/common';
import { InstructorCoreModule } from './instructor-core.module';
import {
  CreateInstructorUseCase,
  FindInstructorDetailUseCase,
  FindInstructorListUseCase,
} from './application/usecases';
import { CompanyAdminInstructorController } from './presentation/controllers';

const useCases: Provider[] = [
  CreateInstructorUseCase,
  FindInstructorDetailUseCase,
  FindInstructorListUseCase,
];

@Module({
  imports: [InstructorCoreModule],
  controllers: [CompanyAdminInstructorController],
  providers: [...useCases],
})
export class CompanyAdminInstructorModule {}
```

## App 모듈 등록

**파일**: `src/module/app.module.ts`

생성한 역할별 모듈을 App 모듈의 imports에 추가합니다.

```typescript
import { Module } from '@nestjs/common';
// 기존 imports...
import { CompanyAdminEntityModule } from './{entity}/company-admin-{entity}.module';
import { UserEntityModule } from './{entity}/user-{entity}.module';

@Module({
  imports: [
    // 기존 모듈들...
    CompanyAdminEntityModule,
    UserEntityModule,
  ],
})
export class AppModule {}
```

## 주의사항

- ✅ Core 모듈 import 필수
- ✅ useCases 배열에 모든 UseCase 포함
- ✅ Event Handler 있으면 등록
- ❌ providers에 Repository 직접 등록하지 않기 (Core 모듈 사용)
