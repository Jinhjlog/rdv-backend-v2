import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';
import { AttendanceResult } from '../models/event/event-result';

export interface EventEndedResultData {
  userId: string;
  result: AttendanceResult;
}

export interface EventEndedEventData {
  eventId: string;
  groupId: string;
  title: string;
  results: EventEndedResultData[];
}

/**
 * 일정 종료 이벤트
 *
 * 일정이 IN_PROGRESS → ENDED로 전환될 때 발행됩니다.
 * EventHandler에서 푸시 알림 발송 등을 처리합니다.
 */
export class EventEndedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly eventId: UniqueEntityId,
    public readonly metadata: EventEndedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.eventId;
  }
}
