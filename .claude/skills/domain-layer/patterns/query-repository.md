# Query Repository Interface 작성 패턴

Query Repository는 복잡한 조회 쿼리 전용 인터페이스입니다. 일반 Repository는 `save()`, `findById()` 등을 담당하고, Query Repository는 `findList()`, `findDetail()` 등 복잡한 조회를 담당합니다.

## 기본 구조

```typescript
import {
  {EntityName}ListItemQueryModel,
  {EntityName}DetailQueryModel,
} from '../models';

/**
 * 필터 타입 정의
 *
 * enum 타입은 별도 type으로 정의합니다.
 */
export type {EntityName}StatusFilter = 'draft' | 'active' | 'ended';

/**
 * 조회 파라미터 인터페이스
 *
 * 복잡한 필터가 있을 경우 별도 인터페이스로 분리합니다.
 */
export interface Find{EntityName}ListParams {
  companyId?: string;
  workplaceId?: string;
  status?: {EntityName}StatusFilter;
  cursor?: { id: string; createdAt: Date };
  limit?: number;
}

/**
 * {EntityName} 조회용 Repository
 *
 * 복잡한 조회 쿼리를 처리합니다.
 */
export abstract class {EntityName}QueryRepository {
  /**
   * 목록을 조회합니다.
   *
   * @param params 조회 필터 파라미터
   * @returns 목록
   */
  abstract findList(
    params?: Find{EntityName}ListParams,
  ): Promise<{EntityName}ListItemQueryModel[]>;

  /**
   * ID로 상세 정보를 조회합니다.
   *
   * @param id 엔티티 ID
   * @returns 상세 정보 또는 undefined
   */
  abstract findDetailById(
    id: string,
  ): Promise<{EntityName}DetailQueryModel | undefined>;

  /**
   * 특정 필드로 목록을 조회합니다.
   *
   * @param {string} companyId 회사 ID
   * @returns 목록
   */
  abstract findListByCompanyId(
    companyId: string,
  ): Promise<{EntityName}ListItemQueryModel[]>;
}
```

## 중요 규칙

- abstract class 사용
- abstract 메서드만 정의
- **QueryModel 타입 반환** (도메인 엔티티 ❌)
- 조회 전용 (write 작업 ❌)
- **한국어 JSDoc 주석**: 각 메서드에 설명 추가
- **Params 인터페이스 분리**: 복잡한 필터는 별도 인터페이스로
- **Type 정의**: enum 타입은 별도 `export type`으로 정의
- **메서드명 규칙**:
  - `findList()` - 파라미터 기반 목록 조회
  - `findDetailById()` - ID 기반 상세 조회
  - `findListByXxx()` - 특정 필드 기반 목록 조회
  - `findDetailByXxx()` - 특정 필드 기반 상세 조회

## 일반 Repository vs Query Repository

| 구분 | 일반 Repository | Query Repository |
|------|----------------|------------------|
| 용도 | 저장, 단일 조회 | 복잡한 조회 |
| 반환 타입 | 도메인 엔티티 | QueryModel |
| 주요 메서드 | `save()`, `findById()` | `findList()`, `findDetail()` |
| Prisma 사용 | `findUnique()`, `upsert()` | `$queryRaw()`, `findMany()` + `include` |
