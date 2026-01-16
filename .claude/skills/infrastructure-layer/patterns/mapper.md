# Mapper 작성 패턴

Mapper는 Prisma 모델과 Domain 모델 간의 변환을 담당합니다.

## Aggregate Root Mapper 패턴

```typescript
import { Prisma, {entity_table} as {Entity}Prisma } from '@prisma/generated/index';
import { {Entity} } from '../../domain/models';
import { BoundedString } from '@lib/domain';

/**
 * {Entity}Mapper
 *
 * 영속성 계층의 {Entity}를 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class {Entity}Mapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   */
  static toDomain(prisma{Entity}: {Entity}Prisma): {Entity} {
    return new {Entity}({
      id: prisma{Entity}.id,
      // Value Objects는 unsafeCreate 사용
      name: BoundedString.unsafeCreate(prisma{Entity}.name),
      createdAt: prisma{Entity}.created_at,
      updatedAt: prisma{Entity}.updated_at,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   */
  static toPersistence(domain{Entity}: {Entity}): Prisma.{entity_table}CreateInput {
    return {
      id: domain{Entity}.id.toString(),
      // Value Objects는 .value 접근
      name: domain{Entity}.name.value,
      created_at: domain{Entity}.createdAt,
      updated_at: domain{Entity}.updatedAt,
    };
  }
}
```

## 하위 Entity Mapper 패턴

```typescript
import { Prisma, {attachment_table} as {Attachment}Prisma } from '@prisma/generated/index';
import { {Attachment} } from '../../domain/models';

/**
 * {Attachment}Mapper
 *
 * 하위 Entity용 Mapper
 */
export class {Attachment}Mapper {
  static toDomain(prisma{Attachment}: {Attachment}Prisma): {Attachment} {
    return new {Attachment}({
      id: prisma{Attachment}.id,
      {aggregateRootId}: prisma{Attachment}.{aggregate_root_id},
      fileName: prisma{Attachment}.file_name,
      fileSize: Number(prisma{Attachment}.file_size),
      createdAt: prisma{Attachment}.created_at,
    });
  }

  static toPersistence(
    domain{Attachment}: {Attachment},
  ): Prisma.{attachment_table}CreateInput {
    return {
      id: domain{Attachment}.id.toString(),
      {entity}s: {
        connect: { id: domain{Attachment}.{aggregateRootId} },
      },
      file_name: domain{Attachment}.fileName,
      file_size: domain{Attachment}.fileSize,
      created_at: domain{Attachment}.createdAt,
    };
  }
}
```

## 중요 규칙

### toDomain() 메서드

- `unsafeCreate()` 사용: DB 데이터는 이미 검증되었음
- snake_case → camelCase 변환
- Number 타입 명시적 변환: `Number(prisma.field)`
- Date 타입은 그대로 사용

### toPersistence() 메서드

- `.value` 접근: Value Objects의 값 추출
- camelCase → snake_case 변환
- 관계 연결: `connect: { id: ... }` 사용 (Prisma 방식)
- UniqueEntityId는 `.toString()` 변환

## 타입 변환 규칙

| Domain 타입 | Prisma 타입 | 변환 방법 |
|-----------|------------|----------|
| `BoundedString` | `string` | `unsafeCreate()` / `.value` |
| `PositiveNumber` | `number` | `unsafeCreate()` / `.value` |
| `UniqueEntityId` | `string` | - / `.toString()` |
| `Date` | `Date` | 그대로 |
| `number` | `BigInt` | `Number()` / 그대로 |

## 주의사항

- ❌ Mapper에서 비즈니스 로직 포함 금지
- ✅ toDomain에서는 항상 `unsafeCreate()` 사용
- ✅ BigInt → number 변환 시 `Number()` 명시
- ✅ 관계 연결은 `connect` 사용
