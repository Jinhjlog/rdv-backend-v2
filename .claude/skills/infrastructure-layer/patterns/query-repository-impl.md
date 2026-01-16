# Query Repository 구현체 작성 패턴

Query Repository는 복잡한 조회 쿼리를 Prisma로 구현합니다.

## 기본 구조

```typescript
import { Injectable } from '@nestjs/common';
import { {Entity}QueryRepository } from '../../domain/repositories';
import {
  {Entity}DetailQueryModel,
  {Entity}ListItemQueryModel,
} from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';

@Injectable()
export class {Entity}QueryRepositoryImpl implements {Entity}QueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDetailById(id: string): Promise<{Entity}DetailQueryModel | undefined> {
    // 단순 조회: findUnique + include
    const result = await this.prisma.{entity_table}.findUnique({
      where: { id },
      include: {
        attachments: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!result) {
      return undefined;
    }

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      // 중첩 객체
      attachments: result.attachments.map(a => ({
        id: a.id,
        fileName: a.file_name,
        fileSize: Number(a.file_size),
      })),
      // nullable 필드
      author: result.author ? {
        userId: result.author.id,
        username: result.author.name,
      } : undefined,
    };
  }

  async findList(): Promise<{Entity}ListItemQueryModel[]> {
    // 복잡한 조회: $queryRaw 사용
    const results = await this.prisma.$queryRaw`
      SELECT
        e.id,
        e.name,
        e.created_at,
        COUNT(r.id) as count
      FROM {entity_table} e
      LEFT JOIN relations r ON r.entity_id = e.id
      GROUP BY e.id, e.name, e.created_at
      ORDER BY e.created_at DESC
    `;

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      count: Number(row.count),
    }));
  }
}
```

## 조회 방식 선택 가이드

### findMany + include (단순 조회)

사용 시기:
- 단순 조인 (1-2개 테이블)
- 집계 함수 없음
- 복잡한 조건 없음

```typescript
const results = await this.prisma.{entity}.findMany({
  where: { status: 'active' },
  include: {
    attachments: true,
  },
});
```

### $queryRaw (복잡한 조회)

사용 시기:
- 복잡한 조인 (3개 이상 테이블)
- 집계 함수 (COUNT, SUM, AVG 등)
- 복잡한 WHERE 조건
- 성능 최적화 필요

```typescript
const results = await this.prisma.$queryRaw`
  SELECT
    e.id,
    COUNT(DISTINCT r.id) as relation_count,
    SUM(v.value) as total_value
  FROM entities e
  LEFT JOIN relations r ON r.entity_id = e.id
  LEFT JOIN values v ON v.entity_id = e.id
  WHERE e.status = 'active'
  GROUP BY e.id
`;
```

## 중요 규칙

- QueryModel은 primitive types만 사용
- 복잡한 조인/집계는 `$queryRaw` 사용
- 단순 조회는 `findMany` + `include` 사용
- bigint 타입은 `Number()` 변환
- nullable 필드는 삼항 연산자로 처리

## 타입 변환

| Prisma Raw 타입 | QueryModel 타입 | 변환 방법 |
|---------------|----------------|----------|
| `BigInt` | `number` | `Number()` |
| `Date` | `Date` | 그대로 |
| `string` | `string` | 그대로 |
| `null` | `undefined` | 삼항 연산자 |

## 주의사항

- ❌ Query Repository에서 write 작업 금지
- ✅ Domain Entity 반환 금지 (QueryModel만)
- ✅ BigInt → number 변환 필수
- ✅ SQL Injection 방지 (parameterized query)
