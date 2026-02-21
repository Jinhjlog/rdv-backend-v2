import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface EventCreatedEventData {
  eventId: string;
  groupId: string;
  createdByUserId: string;
  groupMemberUserIds: string[];
  title: string;
  eventTime: Date;
}

/**
 * 일정 생성 이벤트
 *
 * 새 일정이 생성될 때 발행됩니다.
 * 모임 멤버(생성자 제외)에게 인앱 알림 + Alert 푸시를 전송합니다.
 */
export class EventCreatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly eventId: UniqueEntityId,
    public readonly metadata: EventCreatedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.eventId;
  }
}
