# Aggregate Root 작성 패턴

Aggregate Root는 독립적으로 관리되는 애그리게잇의 대표 엔티티입니다.

## 정의

- **상속**: `AggregateRoot<Props>`
- **특징**:
  - 독립적으로 존재 가능
  - Domain Event 발행 가능
  - Repository를 통해 직접 저장/조회
- **예시**: `Workplace`, `User`, `CompanyPost`, `Instructor`

## 기본 구조

```typescript
import {
  AggregateRoot,
  BoundedString,
  UniqueEntityId,
} from '@lib/domain';

export interface {EntityName}Props {
  id?: string;
  // 필드 정의 (Value Objects 사용)
  name: BoundedString;
  createdAt: Date;
  updatedAt: Date;
}

export class {EntityName} extends AggregateRoot<{EntityName}Props> {
  constructor(props: {EntityName}Props) {
    super(props, new UniqueEntityId(props.id));
  }

  // Getter만 정의 (불변성)
  get name(): BoundedString {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // 도메인 메서드 (비즈니스 로직)
  updateName(name: BoundedString): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
    // 필요시 Domain Event 추가
    // this.addDomainEvent(new NameUpdatedEvent(this.id, { name }));
  }
}
```

## 중요 규칙

- Props 인터페이스에서 `id`는 항상 optional (`id?: string`)
- 모든 getter는 `get` 키워드 사용
- 도메인 메서드는 비즈니스 로직 포함
- Domain Event 발행 가능 (`addDomainEvent()`)
- `@lib/domain`의 Value Objects 적극 활용:
  - `BoundedString`: 길이 제한이 있는 문자열
  - `Email`: 이메일 형식
  - `Phone`: 전화번호 형식
  - `PositiveNumber`: 양수
  - `UniqueEntityId`: 엔티티 ID

## Entity와 구분

| 구분 | Aggregate Root | Entity (하위) |
|------|---------------|--------------|
| 상속 | `AggregateRoot<Props>` | `EntityClass<Props>` |
| 독립성 | 독립적 존재 가능 | 부모 Aggregate에 종속 |
| Repository | 직접 저장/조회 | 부모를 통해 접근 |
| Domain Event | 발행 가능 | 발행 불가 |
