# Application DTO 작성 패턴

Application DTO는 UseCase의 입력 파라미터를 정의합니다. primitive types만 사용합니다.

## Create DTO 패턴

```typescript
export class Create{Entity}Dto {
  userId: string; // 생성자 ID (보통 필요)
  name: string;
  description: string;
  // 필요한 필드 추가
}
```

### 사용 예시

```typescript
const dto: CreateInstructorDto = {
  userId: 'user-123',
  name: '홍길동',
  description: '안전 강사',
};
```

---

## Update DTO 패턴

```typescript
export class Update{Entity}Dto {
  {entity}Id: string; // 대상 ID
  userId: string; // 수정자 ID
  name: string;
  description: string;
  // 수정 가능한 필드
}
```

### 사용 예시

```typescript
const dto: UpdateInstructorDto = {
  instructorId: 'instructor-123',
  userId: 'user-456',
  name: '김철수',
  description: '수석 강사',
};
```

---

## Find List DTO 패턴

```typescript
export class Find{Entity}ListDto {
  userId?: string; // 필터 조건
  statusFilter?: 'all' | 'active' | 'archived';
  cursor?: string; // 커서 페이지네이션
  limit: number;
}
```

### 사용 예시

```typescript
const dto: FindInstructorListDto = {
  userId: 'user-123',
  statusFilter: 'active',
  limit: 20,
};
```

---

## Custom Action DTO 패턴

```typescript
export class {Action}{Entity}Dto {
  {entity}Id: string;
  userId: string;
  // 액션에 필요한 필드
}
```

예: Approve (승인) 액션

```typescript
export class ApproveInstructorDto {
  instructorId: string;
  userId: string; // 승인자 ID
  approvalComment?: string;
}
```

---

## 중요 규칙

- 단순한 `export class`
- primitive types만 사용 (`string`, `number`, `boolean`)
- Value Objects 사용 ❌
- Validation 데코레이터 사용 ❌ (Presentation Layer에서 처리)
- 간결하게 유지

## DTO vs Request DTO

| 구분 | Application DTO | Presentation Request DTO |
|------|----------------|-------------------------|
| 위치 | `application/dtos/` | `presentation/dtos/request/` |
| 목적 | UseCase 입력 | Controller 입력 |
| Validation | 없음 | `@IsNotEmpty()` 등 |
| Documentation | 없음 | `@ApiProperty()` |
| 의존성 | 없음 | `class-validator`, `swagger` |

## 주의사항

- ❌ Application DTO에 Value Objects 사용 금지
- ❌ Validation 데코레이터 사용 금지
- ✅ primitive types만 사용
- ✅ 간결하게 유지
