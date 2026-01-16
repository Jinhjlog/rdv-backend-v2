# Domain Event 작성 패턴

Domain Event는 도메인에서 발생하는 중요한 이벤트를 표현합니다.

## 기본 구조

```typescript
import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface {EventName}Payload {
  // 이벤트 데이터
  fieldName: string;
}

export class {EventName}Event implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly aggregateId: UniqueEntityId,
    public readonly payload?: {EventName}Payload,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.aggregateId;
  }
}
```

## 중요 규칙

- `IDomainEvent` 인터페이스 구현
- `dateTimeOccurred` 필드 필수
- `getAggregateId()` 메서드 구현
- Payload는 optional interface로 분리

## 사용 방법

Aggregate Root에서 이벤트 발행:

```typescript
export class {EntityName} extends AggregateRoot<{EntityName}Props> {
  updateName(name: BoundedString): void {
    this.props.name = name;
    this.props.updatedAt = new Date();

    // Domain Event 발행
    this.addDomainEvent(
      new NameUpdatedEvent(this.id, { name: name.value })
    );
  }
}
```
