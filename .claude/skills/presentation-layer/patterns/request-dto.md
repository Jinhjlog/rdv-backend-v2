# Request DTO 작성 패턴

Request DTO는 클라이언트로부터 받는 데이터를 정의하고 검증합니다.

## 기본 구조

```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsArray,
  IsEnum,
} from 'class-validator';

export class Create{Entity}RequestDto {
  @ApiProperty({
    description: '필드 설명',
    example: '예시 값',
  })
  @IsNotEmpty()
  @IsString()
  fieldName: string;

  @ApiProperty({
    description: '선택 필드 설명',
    example: '예시 값',
    required: false,
  })
  @IsOptional()
  @IsString()
  optionalField?: string;

  @ApiProperty({
    description: '숫자 필드',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  numberField: number;

  @ApiProperty({
    description: 'UUID 필드',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  uuidField: string;

  @ApiProperty({
    description: '불린 필드',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  booleanField: boolean;

  @ApiProperty({
    description: '배열 필드',
    example: ['item1', 'item2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  arrayField?: string[];

  @ApiProperty({
    description: 'Enum 필드',
    enum: ['option1', 'option2', 'option3'],
    example: 'option1',
  })
  @IsNotEmpty()
  @IsEnum(['option1', 'option2', 'option3'])
  enumField: string;
}
```

## Validation 데코레이터

| 데코레이터 | 용도 |
|-----------|------|
| `@IsNotEmpty()` | 필수 필드 |
| `@IsOptional()` | 선택 필드 |
| `@IsString()` | 문자열 |
| `@IsNumber()` | 숫자 |
| `@IsBoolean()` | 불린 |
| `@IsUUID()` | UUID |
| `@IsArray()` | 배열 |
| `@IsEnum()` | Enum |

## 중요 규칙

- `@ApiProperty()`: Swagger 문서화 (description, example 필수)
- 선택 필드는 `required: false` + `?` 타입
- 배열 검증은 `{ each: true }` 옵션 사용
- Enum은 `enum` 속성으로 가능한 값 명시

## 주의사항

- ❌ `@ApiProperty()` 누락 금지
- ✅ 모든 필드에 적절한 Validation 데코레이터 추가
- ✅ description과 example 작성
