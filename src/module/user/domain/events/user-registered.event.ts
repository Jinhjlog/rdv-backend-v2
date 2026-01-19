import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface UserRegisteredEventData {
  characterCode: string;
}

export class UserRegisteredEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly userId: UniqueEntityId,
    public readonly metadata: UserRegisteredEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.userId;
  }
}
