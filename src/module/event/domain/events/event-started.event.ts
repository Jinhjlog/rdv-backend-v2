import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface EventStartedEventData {
  eventId: string;
  groupId: string;
  participantUserIds: string[];
  eventTime: Date;
  endTime: Date;
}

/**
 * 일정 시작 이벤트
 *
 * 일정이 RECRUITING → IN_PROGRESS로 전환될 때 발행됩니다.
 * EventHandler에서 일정 종료 스케줄링, 푸시 알림 발송 등을 처리합니다.
 */
export class EventStartedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly eventId: UniqueEntityId,
    public readonly metadata: EventStartedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.eventId;
  }
}
