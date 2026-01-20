import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface ParticipantsCheckPassedEventData {
  eventId: string;
  participantCount: number;
  trackingStartTime: Date;
}

/**
 * 참여자 체크 통과 이벤트
 *
 * 일정 시작 전 참여자 수가 최소 인원(2명) 이상일 때 발행됩니다.
 * EventHandler에서 위치 공유 시작 스케줄링을 예약합니다.
 */
export class ParticipantsCheckPassedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly eventId: UniqueEntityId,
    public readonly metadata: ParticipantsCheckPassedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.eventId;
  }
}
