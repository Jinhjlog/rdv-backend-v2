# Repository Interface 작성 패턴

Repository는 도메인 엔티티의 저장소 인터페이스입니다.

## 기본 구조

```typescript
import { {EntityName} } from '../models';

export abstract class {EntityName}Repository {
  abstract save(entity: {EntityName}): Promise<void>;
  abstract findById(id: string): Promise<{EntityName} | undefined>;
  // 필요한 메서드 추가
}
```

## 중요 규칙

- abstract class 사용
- abstract 메서드만 정의
- 도메인 엔티티 타입 사용 (Prisma 타입 사용 금지)
- 간결하게 유지 (복잡한 쿼리는 Query Repository로 분리)

## 일반 Repository vs Query Repository

| 구분 | 일반 Repository | Query Repository |
|------|----------------|------------------|
| 용도 | 저장, 단일 조회 | 복잡한 조회 |
| 반환 타입 | 도메인 엔티티 | QueryModel |
| 주요 메서드 | `save()`, `findById()` | `findList()`, `findDetail()` |
| Prisma 사용 | `findUnique()`, `upsert()` | `$queryRaw()`, `findMany()` + `include` |
