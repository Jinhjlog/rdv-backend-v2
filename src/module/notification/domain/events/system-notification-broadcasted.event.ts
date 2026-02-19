import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface SystemNotificationBroadcastedEventData {
  title: string;
  subtitle: string;
  sendPush: boolean;
}

/**
 * 시스템 공지 브로드캐스트 이벤트
 *
 * 관리자가 전체 유저 대상으로 시스템 공지를 전송할 때 발행됩니다.
 * device-token 모듈의 SystemNotificationPushHandler가 수신하여 FCM 푸시를 전송합니다.
 */
export class SystemNotificationBroadcastedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly aggregateId: UniqueEntityId,
    public readonly metadata: SystemNotificationBroadcastedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.aggregateId;
  }
}
