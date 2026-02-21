import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { formatKoreanDateTime } from '@shared/utils';
import { EventCancelledEvent } from '../../../event/domain/events';
import { AlertPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 일정 취소/삭제 푸시 핸들러
 *
 * EventCancelledEvent를 수신하여 MEETING 알림 구독 중인 참여자에게 Alert 푸시를 전송합니다.
 * - E3 (사용자 삭제): 삭제자 제외
 * - E4 (시스템 자동 취소): 전원
 */
@Injectable()
export class EventCancelledPushHandler implements OnModuleInit {
  private readonly logger = new Logger(EventCancelledPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventCancelledEvent) => void this.handle(event),
      EventCancelledEvent.name,
    );
  }

  async handle(event: EventCancelledEvent): Promise<void> {
    const {
      eventId,
      groupId,
      cancelledByUserId,
      participantUserIds,
      title,
      eventTime,
      participantCount,
    } = event.metadata;

    const isSystemCancel = !cancelledByUserId;

    const targetUserIds = isSystemCancel
      ? participantUserIds
      : participantUserIds.filter((id) => id !== cancelledByUserId);

    if (targetUserIds.length === 0) {
      this.logger.log('푸시 대상 없음');
      return;
    }

    const notificationTitle = isSystemCancel
      ? '📅 인원 부족으로 일정이 취소됐어요'
      : '📅 참여 중인 일정이 취소됐어요';

    const body = isSystemCancel
      ? `${title} · 참여자 ${participantCount}명 (최소 2명 필요)`
      : `${title} · ${formatKoreanDateTime(eventTime)}`;

    const result =
      await this.pushDispatchService.sendAlertPushToTargetSubscribers({
        userIds: targetUserIds,
        type: AlertPushType.Meeting,
        topic: 'event-cancelled',
        notification: { title: notificationTitle, body },
        data: {
          targetScreen: 'notifications',
          eventId,
          groupId,
        },
      });

    if (!result.sent) {
      this.logger.warn(`일정 취소 푸시 발송 대상 없음: eventId=${eventId}`);
      return;
    }

    this.logger.log(
      `일정 취소 Alert 푸시 발송 완료: eventId=${eventId}, 성공=${result.successCount}, 실패=${result.failureCount}`,
    );
  }
}
