import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface EventCancelledEventData {
  eventId: string;
  reason: string;
  participantCount: number;
}

/**
 * 일정 취소 이벤트
 *
 * 참여자 부족 등의 이유로 일정이 취소될 때 발행됩니다.
 */
export class EventCancelledEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly eventId: UniqueEntityId,
    public readonly metadata: EventCancelledEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.eventId;
  }
}
