---
name: presentation-layer
description: 'DDD 프레젠테이션 레이어 구현. Controllers, Request/Response DTOs, Transformers를 생성. "프레젠테이션 레이어 구현" 또는 "presentation layer" 키워드 사용 시 실행.'
allowed-tools: Read, Write, Glob, Grep, Bash
user-invocable: true
---

# Presentation Layer 구현 스킬

## 실행 트리거

- "프레젠테이션 레이어 구현", "presentation layer"
- "Controller 만들어줘", "컨트롤러 생성"
- "API 엔드포인트 추가"
- "Request DTO 작성", "Response DTO 작성"
- "Transformer 추가"

---

## 파일 구조

```
src/module/{module-name}/presentation/
├── controllers/
│   ├── {entity}.controller.ts          # 공개 API (인증 불필요)
│   ├── admin-{entity}.controller.ts    # 관리자 API (@AdminAuth)
│   └── index.ts
├── dtos/
│   ├── request/
│   │   ├── get-{entity}-list.request.dto.ts
│   │   ├── get-admin-{entity}-list.request.dto.ts
│   │   ├── create-{entity}.request.dto.ts
│   │   ├── update-{entity}.request.dto.ts
│   │   └── index.ts
│   ├── response/
│   │   ├── {entity}-list.response.dto.ts
│   │   ├── {entity}-detail.response.dto.ts
│   │   ├── admin-{entity}-list.response.dto.ts
│   │   ├── admin-{entity}-detail.response.dto.ts
│   │   └── index.ts
│   └── index.ts
└── transformers/
    ├── {entity}.transformer.ts         # 공개 API 변환
    ├── admin-{entity}.transformer.ts   # 관리자 API 변환
    └── index.ts
```

---

## 핵심 규칙

### 1. 컨트롤러 분리

- **공개 API**: `{entity}.controller.ts` — 인증 데코레이터 없음, GET만 제공
- **관리자 API**: `admin-{entity}.controller.ts` — 클래스 레벨 `@AdminAuth()`, CRUD 전체

### 2. 인증 패턴

> **인증/인가 방식은 프로젝트마다 다를 수 있습니다.**
> 구현 전 반드시 해당 프로젝트의 기존 인증 데코레이터, Guard, 사용자 정보 주입 방식을 파악한 후 동일하게 적용합니다.

```typescript
// 관리자 API — 클래스 레벨 인증
@AdminAuth()
@Controller({ path: 'admin/{entities}', version: '1' })
export class Admin{Entity}Controller {
  @Post()
  async create(@Body() dto, @CurrentAdmin() admin: AuthenticatedAdmin) {
    // admin.adminId, admin.name 사용
  }
}

// 공개 API — 인증 없음
@Controller({ path: '{entities}', version: '1' })
export class {Entity}Controller { ... }
```

**import 경로:**

```typescript
import { AdminAuth } from '../../../admin/presentation/decorators/admin-auth.decorator';
import { CurrentAdmin } from '../../../admin/presentation/decorators/current-admin.decorator';
import type { AuthenticatedAdmin } from '../../../admin/presentation/guards';
```

### 3. ID 타입

- **ULID 사용** (UUID 아님)
- `ParseUUIDPipe` 사용 금지
- 파라미터는 `@Param('entityId') id: string`으로 직접 받음
- 예시: `01HXK3G5N7MZQR8BVWEY6JKFP4`

### 4. 목록 조회 컨트롤러 패턴

```typescript
// 페이지네이션 있는 목록 — @Query() DTO 사용
@Get()
async getList(@Query() dto: GetListRequestDto): Promise<ListResponseDto> {
  const result = await this.findListUseCase.execute({
    limit: dto.limit ?? 20,
    page: dto.page ?? 1,
    keyword: dto.keyword,
  });
  return Transformer.toListResponse(result);
}

// 단순 목록 (카테고리, 활성 팝업 등) — 파라미터 없음
@Get()
async getCategoryList(): Promise<CategoryListResponseDto> {
  const items = await this.findCategoryListUseCase.execute();
  return CategoryTransformer.toListResponse(items);
}
```

### 5. Transformer 필수 사용

- **컨트롤러에서 인라인 맵핑 금지** — 반드시 Transformer 사용
- Transformer는 `static` 메서드만 사용
- `toListResponse()`, `toDetailResponse()` 메서드 제공

### 6. nullable 처리 규칙

**Transformer (domain → presentation):**

```typescript
// 단순 필드: undefined → null 변환 (삼항 연산자 필수)
description: readModel.description !== undefined ? readModel.description : null,

// 중첩 객체
category: readModel.category !== undefined
  ? { id: readModel.category.id, name: readModel.category.name }
  : null,
```

**QueryService Impl (DB → domain):**

```typescript
// null → undefined 변환 (삼항 연산자 필수)
email: record.email !== null ? record.email : undefined,
```

> `??` 연산자 사용 금지. 삼항 연산자를 사용해야 정확합니다.

### 7. Swagger 문서화

모든 엔드포인트에 필수:

- `@ApiOperation({ summary, description })` — description은 HTML `<br>` 사용
- `@ApiOkResponse` / `@ApiCreatedResponse` — 성공 응답 타입
- `@ApiBadRequestResponse` — 검증 실패 에러 코드 명시
- `@ApiNotFoundResponse` — 404 에러 코드 명시
- `@ApiParam` — URL 파라미터 설명
- `@HttpCode()` — 명시적 상태 코드 (GET: OK, POST: CREATED, DELETE: NO_CONTENT)

### 8. 페이지네이션 응답 구조

```typescript
{
  items: ListItemDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
```

### 9. index.ts 패턴

모든 하위 디렉토리에 `index.ts`로 re-export:

```typescript
export * from './{file-name}';
```

---

## 구현 순서

1. **Response DTOs** → 응답 구조 정의
2. **Request DTOs** → 요청 검증 정의
3. **Transformer** → ReadModel → Response DTO 변환
4. **Controller** → 엔드포인트 연결
5. **Swagger** → `Skill({ skill: 'swagger-bot' })` 호출하여 Swagger 데코레이터 생성

---

## 상세 패턴 문서

- `patterns/controller.md`: 컨트롤러 작성 규칙
- `patterns/request-dto.md`: Request DTO 작성 규칙
- `patterns/response-dto.md`: Response DTO 작성 규칙
- `patterns/transformer.md`: Transformer 작성 규칙

---

## 금지 사항

- Controller에 비즈니스 로직 작성 금지
- Controller에서 인라인 맵핑 금지 (Transformer 필수)
- `ParseUUIDPipe` 사용 금지 (ULID)
- `?? undefined`, `?? null` 사용 금지 (삼항 연산자 사용)
- `@ApiProperty()` 누락 금지
- Swagger 문서화 누락 금지
- Validation 데코레이터 누락 금지
