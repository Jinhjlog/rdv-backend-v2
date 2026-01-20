import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface ParticipantDepartedEventData {
  eventId: string;
  groupId: string;
  userId: string;
}

/**
 * 참여자 출발 이벤트
 *
 * 참여자가 PREPARING → DEPARTED로 전환될 때 발행됩니다.
 * EventHandler에서 푸시 알림 발송 등을 처리합니다.
 */
export class ParticipantDepartedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly eventId: UniqueEntityId,
    public readonly metadata: ParticipantDepartedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.eventId;
  }
}
