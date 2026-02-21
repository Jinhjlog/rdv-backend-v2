import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface EventCancelledEventData {
  eventId: string;
  groupId: string;
  groupName: string;
  title: string;
  eventTime: Date;
  participantUserIds: string[];
  participantCount: number;
  reason: string;
  /** 사용자에 의한 삭제 시 삭제자 ID, 시스템 자동 취소 시 undefined */
  cancelledByUserId?: string;
}

/**
 * 일정 취소 이벤트
 *
 * 사용자에 의한 일정 삭제(E3) 또는 참여자 부족 자동 취소(E4) 시 발행됩니다.
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
