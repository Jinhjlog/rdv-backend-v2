# Transformer 작성 패턴

Transformer는 Domain Query Model을 Presentation Response DTO로 변환합니다.

## 기본 구조

```typescript
import {
  {Entity}DetailQueryModel,
  {Entity}ListItemQueryModel,
} from '../../domain/models';
import {
  {Entity}DetailResponseDto,
  {Entity}ListResponseDto,
} from '../dtos/response';

export class {Entity}Transformer {
  static toDetailResponse(
    queryModel: {Entity}DetailQueryModel,
  ): {Entity}DetailResponseDto {
    return {
      id: queryModel.id,
      name: queryModel.name,
      // nullable 처리
      nullableField: queryModel.nullableField !== undefined
        ? queryModel.nullableField
        : null,
      isActive: queryModel.isActive,
      count: queryModel.count,
      createdAt: queryModel.createdAt,
      // 중첩 객체
      nested: {
        nestedField: queryModel.nested.nestedField,
      },
      // 중첩 배열
      nestedArray: queryModel.nestedArray.map((item) => ({
        nestedField: item.nestedField,
      })),
    };
  }

  static toListResponse(
    queryModels: {Entity}ListItemQueryModel[],
  ): {Entity}ListResponseDto {
    return {
      items: queryModels.map((model) => ({
        id: model.id,
        name: model.name,
        createdAt: model.createdAt,
      })),
    };
  }
}
```

## 중요 규칙

- QueryModel을 입력으로 받음
- Response DTO를 반환
- static 메서드 사용
- nullable 처리: `field !== undefined ? field : null`
- 배열은 `.map()` 사용

## 주의사항

- ❌ 직접 Response DTO 생성 금지 (항상 Transformer 사용)
- ✅ Domain Layer와 Presentation Layer 분리 유지
- ✅ nullable 필드 명시적 처리
