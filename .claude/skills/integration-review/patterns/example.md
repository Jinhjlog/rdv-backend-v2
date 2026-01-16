# 예시: Instructor 모듈 통합

실제 Instructor 모듈을 통합하는 전체 예시입니다.

## 1. 생성된 파일 확인

```bash
src/module/instructor/
├── domain/
│   ├── models/
│   │   └── instructor/
│   │       ├── instructor.ts
│   │       └── instructor-name.ts
│   ├── repositories/
│   │   └── instructor.repository.ts
│   └── services/
│       └── instructor-creation.service.ts
├── infra/
│   ├── repositories/
│   │   └── instructor.repository.impl.ts
│   └── mappers/
│       └── instructor.mapper.ts
├── application/
│   ├── usecases/
│   │   ├── create-instructor.usecase.ts
│   │   ├── find-instructor-detail.usecase.ts
│   │   └── find-instructor-list.usecase.ts
│   └── dtos/
│       ├── create-instructor.dto.ts
│       └── find-instructor-list.dto.ts
└── presentation/
    ├── controllers/
    │   └── company-admin-instructor.controller.ts
    ├── dtos/
    │   ├── request/
    │   │   └── create-instructor.request.dto.ts
    │   └── response/
    │   │   ├── instructor-detail.response.dto.ts
    │   │   └── instructor-list.response.dto.ts
    └── transformers/
        └── instructor.transformer.ts
```

## 2. instructor-core.module.ts 작성

```typescript
import { Module } from '@nestjs/common';
import { InstructorRepository } from './domain/repositories';
import { InstructorRepositoryImpl } from './infra/repositories';
import { InstructorCreationService } from './domain/services';

@Module({
  imports: [],
  providers: [
    // Domain Service
    InstructorCreationService,

    // Repository
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

## 3. company-admin-instructor.module.ts 작성

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

## 4. app.module.ts 업데이트

```typescript
import { Module } from '@nestjs/common';
// ... 기존 imports
import { CompanyAdminInstructorModule } from './instructor/company-admin-instructor.module';

@Module({
  imports: [
    // ... 기존 모듈들
    CompanyAdminInstructorModule,
  ],
})
export class AppModule {}
```

## 5. 검증

```bash
# Lint 검증
npm run lint

# Build 검증
npm run build
```

**예상 결과:**
```
✅ Lint 통과!
✅ Build 통과!
```

## 6. 파일 위치 정리

| 파일 | 위치 |
|------|------|
| Core 모듈 | `src/module/instructor/instructor-core.module.ts` |
| 역할별 모듈 | `src/module/instructor/company-admin-instructor.module.ts` |
| App 모듈 | `src/module/app.module.ts` |

## 7. 완료 체크리스트

- ✅ instructor-core.module.ts 생성
- ✅ Repository 등록 (provide/useClass)
- ✅ Domain Service 등록 및 export
- ✅ company-admin-instructor.module.ts 생성
- ✅ Core 모듈 import
- ✅ UseCases 등록
- ✅ Controller 등록
- ✅ app.module.ts에 역할별 모듈 추가
- ✅ npm run lint 통과
- ✅ npm run build 통과
