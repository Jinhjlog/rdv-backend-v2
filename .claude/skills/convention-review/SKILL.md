---
name: convention-review
description: 'DDD 컨벤션 검증 스킬. 모듈의 파일 구조, 네이밍, 패턴 준수 여부를 검사하여 리포트를 출력합니다. "컨벤션 검증", "convention review", "코드 검증", "구조 검증" 키워드 사용 시 실행.'
allowed-tools: Read, Glob, Grep, Bash
user-invocable: true
---

# DDD Convention Review 스킬

지정된 모듈의 컨벤션 준수 여부를 검증하고 리포트를 출력합니다.

## 사용법

```
/convention-review <모듈명>
```

예시: `/convention-review notice`, `/convention-review organization`

인자가 없으면 변경된 파일이 속한 모듈을 자동 감지합니다.

---

## 실행 프로세스

### 1단계: 대상 모듈 확인

`src/module/<모듈명>/` 경로가 존재하는지 확인합니다.

### 2단계: 디렉토리 구조 검증

모듈 루트에서 다음 디렉토리 존재 여부를 확인합니다:

```
src/module/<모듈>/
├── domain/
│   ├── models/          # 필수
│   ├── repositories/    # 필수 (Aggregate Root가 있는 경우)
│   └── services/        # 선택 (QueryService, LookupService 등)
├── application/
│   ├── usecases/        # 필수
│   ├── dtos/            # 필수
│   ├── ports/           # 선택 (외부 서비스 추상화)
│   └── ohs/             # 선택 (BC 간 공개 API)
├── infra/
│   ├── repositories/    # 필수 (domain/repositories가 있는 경우)
│   ├── mappers/         # 필수
│   ├── services/        # 선택 (QueryService, LookupService 구현체)
│   ├── adapters/        # 선택 (Port 구현체)
│   └── ohs/             # 선택 (OHS 구현체)
└── presentation/
    ├── controllers/     # 필수
    ├── dtos/            # 필수
    │   ├── request/     # 필수
    │   └── response/    # 필수
    └── transformers/    # 필수
```

### 3단계: 파일 네이밍 검증

각 디렉토리의 파일명이 컨벤션을 따르는지 확인합니다:

| 위치                        | 패턴                                   | 예시                              |
| --------------------------- | -------------------------------------- | --------------------------------- |
| domain/models/              | `{entity-name}.ts`                     | `notice.ts`                       |
| domain/models/              | `{entity-name}.read-model.ts`          | `notice.read-model.ts`            |
| domain/repositories/        | `{entity-name}.repository.ts`          | `notice.repository.ts`            |
| domain/services/            | `{entity}-query.service.ts`            | `notice-query.service.ts`         |
| domain/services/            | `{type}-lookup.service.ts`             | `category-lookup.service.ts`      |
| application/usecases/       | `{verb}-{entity}-{purpose}.usecase.ts` | `find-notice-list.usecase.ts`     |
| application/dtos/           | `{verb}-{entity}.dto.ts`               | `create-notice.dto.ts`            |
| application/ports/          | `{service-name}.port.ts`               | `file-storage.port.ts`            |
| application/ohs/            | `{service-name}.service.ts`            | `profanity-check.service.ts`      |
| infra/repositories/         | `{entity-name}.repository.impl.ts`     | `notice.repository.impl.ts`       |
| infra/mappers/              | `{entity}.mapper.ts`                   | `notice.mapper.ts`                |
| infra/services/             | `{entity}-query.service.impl.ts`       | `notice-query.service.impl.ts`    |
| infra/services/             | `{type}-lookup.service.impl.ts`        | `category-lookup.service.impl.ts` |
| infra/adapters/             | `{tech}-{port-name}.adapter.ts`        | `firebase-storage.adapter.ts`     |
| infra/ohs/                  | `{service-name}.service.impl.ts`       | `profanity-check.service.impl.ts` |
| presentation/controllers/   | `{entity}.controller.ts` (public)      | `notice.controller.ts`            |
| presentation/controllers/   | `admin-{entity}.controller.ts` (admin) | `admin-notice.controller.ts`      |
| presentation/dtos/request/  | `{verb}-{entity}.request.dto.ts`       | `create-notice.request.dto.ts`    |
| presentation/dtos/response/ | `{entity}-{purpose}.response.dto.ts`   | `notice-list.response.dto.ts`     |
| presentation/transformers/  | `{entity}.transformer.ts`              | `notice.transformer.ts`           |

### 4단계: Index (Barrel) 파일 검증

다음 디렉토리에 `index.ts`가 존재하는지 확인합니다:

- `domain/models/`
- `domain/repositories/`
- `domain/services/` (존재하는 경우)
- `application/usecases/`
- `application/dtos/`
- `application/ports/` (존재하는 경우)
- `application/ohs/` (존재하는 경우)
- `infra/repositories/`
- `infra/mappers/`
- `infra/services/` (존재하는 경우)
- `infra/adapters/` (존재하는 경우)
- `infra/ohs/` (존재하는 경우)
- `presentation/controllers/`
- `presentation/dtos/`
- `presentation/dtos/request/`
- `presentation/dtos/response/`
- `presentation/transformers/`

추가 검증:

- `.impl` 파일이 barrel export에 포함되어 있지 않은지 확인

### 5단계: 클래스/인터페이스 네이밍 검증

파일을 읽어서 내부 클래스/인터페이스명이 컨벤션을 따르는지 확인합니다:

| 파일 위치                                | 클래스명 패턴                                       | 타입                   |
| ---------------------------------------- | --------------------------------------------------- | ---------------------- |
| domain/repositories/                     | `{Entity}Repository`                                | abstract class         |
| domain/services/\*-query.service.ts      | `{Entity}QueryService`                              | abstract class         |
| domain/services/\*-lookup.service.ts     | `{Type}LookupService`                               | abstract class         |
| application/ohs/                         | `{ServiceName}Service`                              | abstract class         |
| application/ports/                       | `{ServiceName}Port`                                 | abstract class         |
| infra/repositories/                      | `{Entity}RepositoryImpl`                            | class + @Injectable()  |
| infra/services/\*-query.service.impl.ts  | `{Entity}QueryServiceImpl`                          | class + @Injectable()  |
| infra/services/\*-lookup.service.impl.ts | `{Type}LookupServiceImpl`                           | class + @Injectable()  |
| infra/ohs/                               | `{ServiceName}ServiceImpl`                          | class + @Injectable()  |
| infra/adapters/                          | `{Tech}{ServiceName}Adapter`                        | class + @Injectable()  |
| infra/mappers/                           | `{Entity}Mapper`                                    | class (static methods) |
| presentation/transformers/               | `{Entity}Transformer`                               | class (static methods) |
| presentation/controllers/                | `{Entity}Controller` 또는 `Admin{Entity}Controller` | class + @Controller()  |
| application/usecases/                    | `{Verb}{Entity}{Purpose}UseCase`                    | class + @Injectable()  |

### 6단계: 코드 패턴 검증

각 레이어의 코드 패턴을 확인합니다:

**Aggregate Root:**

- `extends AggregateRoot<Props>` 상속 여부
- `private constructor` 여부
- `static create()` 메서드 존재
- `static unsafeCreate()` 메서드 존재

**Repository Interface:**

- `abstract class` 선언 여부 (interface가 아닌지)
- 메서드가 `abstract` 키워드를 포함하는지

**Repository Implementation:**

- `@Injectable()` 데코레이터 여부
- `PrismaService` 주입 여부
- Mapper 사용 여부 (`toDomain`, `toPersistence`)
- Domain Events 발행 여부 (`DomainEvents.dispatchEventsForAggregate`)

**Mapper:**

- `static toDomain()` 메서드 존재
- `static toPersistence()` 메서드 존재
- `unsafeCreate()` 사용 여부 (toDomain에서)

**UseCase:**

- `@Injectable()` 데코레이터 여부
- `execute()` 메서드 존재

**Controller:**

- `@Controller()` 데코레이터 + `version: '1'` 포함 여부
- Transformer 사용 여부

**Application DTO:**

- `interface` 선언 여부 (class가 아닌지)

**Presentation Request DTO:**

- `class` 선언 여부 (interface가 아닌지)
- class-validator 데코레이터 사용 여부

**Presentation Response DTO:**

- `class` 선언 여부
- `@ApiProperty()` 데코레이터 사용 여부

### 7단계: 모듈 등록 검증

`{모듈}.module.ts` 파일을 읽어서 확인합니다:

- `useCases` 배열이 모듈 레벨에 정의되어 있는지
- `...useCases`가 providers에 spread 되어 있는지
- Repository, QueryService 등 인터페이스 바인딩이 `provide/useClass` 패턴인지
- domain/repositories/에 정의된 모든 Repository가 providers에 바인딩되어 있는지
- domain/services/에 정의된 모든 Service가 providers에 바인딩되어 있는지

### 8단계: Import 경로 검증

모듈 내 모든 `.ts` 파일의 import 구문을 확인합니다:

- `@lib/`: 도메인 기반 클래스만 import
- `@core/`: 인프라 공통 모듈만 import
- `@shared/`: 공유 유틸/예외만 import
- `@prisma/generated/*`: infra 레이어에서만 사용
- 도메인 레이어에서 Prisma 직접 import 금지
- 도메인 레이어에서 infra 레이어 import 금지
- application 레이어에서 presentation 레이어 import 금지

---

## 리포트 출력 형식

```
============================================
 Convention Review Report: <모듈명>
============================================

## 디렉토리 구조
 [PASS] domain/models/ 존재
 [PASS] domain/repositories/ 존재
 [FAIL] domain/services/ 누락 (QueryService 인터페이스 필요)
 ...

## 파일 네이밍
 [PASS] notice.ts - Aggregate Root
 [PASS] notice.repository.ts - Repository Interface
 [FAIL] noticeQuery.service.ts - 잘못된 네이밍 (notice-query.service.ts 여야 함)
 ...

## Index 파일
 [PASS] domain/repositories/index.ts 존재
 [FAIL] presentation/transformers/index.ts 누락
 ...

## 클래스/인터페이스 네이밍
 [PASS] NoticeRepository - abstract class
 [FAIL] NoticeQueryService - interface로 선언됨 (abstract class여야 함)
 ...

## 코드 패턴
 [PASS] Notice - private constructor, create(), unsafeCreate()
 [PASS] NoticeRepositoryImpl - @Injectable(), PrismaService 주입
 [FAIL] NoticeMapper - toPersistence()에서 .value 추출 누락
 ...

## 모듈 등록
 [PASS] useCases 배열 정의됨
 [PASS] NoticeRepository → NoticeRepositoryImpl 바인딩
 [FAIL] NoticeQueryService 바인딩 누락
 ...

## Import 경로
 [PASS] 도메인 레이어에서 Prisma import 없음
 [FAIL] domain/models/notice.ts - @prisma/generated 직접 import 감지
 ...

============================================
 결과: PASS 42 / FAIL 3 / WARN 1
============================================

[FAIL 항목 수정 가이드]
1. domain/services/ 디렉토리를 생성하고 NoticeQueryService 인터페이스를 추가하세요.
2. ...
```

---

## 주의사항

- 이 스킬은 **읽기 전용**입니다. 코드를 수정하지 않습니다.
- FAIL 항목에 대해 수정 가이드를 제시하되, 직접 수정하지 않습니다.
- 선택적 디렉토리(ports, ohs, adapters)는 존재하는 경우에만 검증합니다.
- 모듈 특성에 따라 일부 규칙이 적용되지 않을 수 있습니다 (예: core 모듈은 DDD 구조를 따르지 않음).
