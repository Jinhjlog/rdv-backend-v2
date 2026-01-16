# Query Model 작성 패턴

Query Model은 복잡한 조회 결과를 표현하기 위한 모델입니다. 도메인 엔티티와 달리 primitive types만 사용합니다.

## 기본 구조

```typescript
/**
 * {EntityName} 목록 조회용 쿼리 모델
 *
 * - 설명: 무엇을 위한 목록 조회인지 한국어로 설명
 * - 사용자: 누가 사용하는지 명시 (예: 관리자, 근로자)
 */
export interface {EntityName}ListItemQueryModel {
  id: string;
  name: string;
  status: string; // 'draft' | 'active' | 'ended'  // enum 값은 주석으로 명시
  createdAt: Date;
  updatedAt: Date;
  // 집계된 필드
  count: number;
}

/**
 * {EntityName} 상세 조회용 쿼리 모델
 */
export interface {EntityName}DetailQueryModel {
  id: string;
  name: string;
  description: string;
  status: string; // 'draft' | 'active' | 'ended'
  createdAt: Date;
  updatedAt: Date;
  // 중첩 객체는 별도 인터페이스 분리
  attachments: {EntityName}AttachmentQueryModel[];
  // 관련 엔티티 정보
  author?: {EntityName}AuthorQueryModel;
}

/**
 * {EntityName} 첨부파일 쿼리 모델
 *
 * 중첩 객체는 별도 인터페이스로 분리합니다.
 */
export interface {EntityName}AttachmentQueryModel {
  id: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
}

/**
 * {EntityName} 작성자 쿼리 모델
 */
export interface {EntityName}AuthorQueryModel {
  userId: string;
  username: string;
}
```

## 중요 규칙

- **한국어 JSDoc 주석**: 각 인터페이스 상단에 용도 설명
- **primitive types만 사용**: `string`, `number`, `boolean`, `Date`
- **Value Objects 사용 금지**: `BoundedString` 등 대신 raw `string` 사용
- **도메인 엔티티 참조 금지**: 조회 결과를 표현하는 순수 데이터 모델
- **인터페이스로 정의**
- **목록용/상세용 구분**: `{Entity}ListItemQueryModel`, `{Entity}DetailQueryModel`
- **중첩 객체 분리**: 복잡한 중첩 객체는 별도 인터페이스로 정의
- **enum 값 주석 명시**: `status: string; // 'draft' | 'active' | 'ended'`

## 언제 사용하는가?

- 복잡한 조인 쿼리 결과
- 여러 엔티티의 데이터를 합친 경우
- 집계 함수 (COUNT, SUM 등) 사용
- API 응답을 위한 최적화된 데이터 모델
