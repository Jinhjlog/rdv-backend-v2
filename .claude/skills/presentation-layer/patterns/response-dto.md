# Response DTO 작성 패턴

Response DTO는 클라이언트에게 반환하는 데이터 구조를 정의합니다.

## Detail Response DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';

// 중첩 클래스 (같은 파일에 정의)
class {Entity}NestedDto {
  @ApiProperty({
    description: '중첩 필드',
    example: '값',
  })
  nestedField: string;
}

export class {Entity}DetailResponseDto {
  @ApiProperty({
    type: String,
    description: 'ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '이름',
    example: '이름 예시',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Nullable 필드',
    example: '값',
    nullable: true,
  })
  nullableField: string | null;

  @ApiProperty({
    type: Boolean,
    description: '불린 필드',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    type: Number,
    description: '숫자 필드',
    example: 100,
  })
  count: number;

  @ApiProperty({
    type: Date,
    description: '날짜 필드',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '중첩 객체',
    type: {Entity}NestedDto,
  })
  nested: {Entity}NestedDto;

  @ApiProperty({
    description: '중첩 객체 배열',
    type: [{Entity}NestedDto],
  })
  nestedArray: {Entity}NestedDto[];
}
```

## List Response DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class {Entity}ListItemResponseDto {
  @ApiProperty({
    description: 'ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '이름',
    example: '이름 예시',
  })
  name: string;

  @ApiProperty({
    description: '생성일',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class {Entity}ListResponseDto {
  @ApiProperty({
    description: '{엔티티} 목록',
    type: [{Entity}ListItemResponseDto],
  })
  items: {Entity}ListItemResponseDto[];
}
```

## 중요 규칙

- nullable 필드는 `nullable: true` + `string | null` 타입
- 중첩 클래스는 같은 파일에 정의
- 목록 응답은 `items` 배열로 감싸기
- `type` 명시 (String, Number, Boolean, Date 등)
- 배열은 `[ClassName]` 형태

## 주의사항

- ❌ nullable 처리 누락 금지
- ✅ 모든 필드에 `@ApiProperty()` 추가
- ✅ 타입 명시 및 example 작성
