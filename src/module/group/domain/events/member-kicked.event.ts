import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface MemberKickedEventData {
  groupId: string;
  groupName: string;
  kickedUserId: string;
}

/**
 * 멤버 강퇴 이벤트
 *
 * 모임장이 멤버를 강퇴할 때 발행됩니다.
 * 강퇴된 사용자에게 인앱 알림 및 Alert 푸시를 전송합니다.
 */
export class MemberKickedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly aggregateId: UniqueEntityId,
    public readonly metadata: MemberKickedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.aggregateId;
  }
}
