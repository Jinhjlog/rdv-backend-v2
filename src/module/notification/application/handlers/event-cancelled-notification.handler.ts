import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { formatKoreanDateTime } from '@shared/utils';
import { EventCancelledEvent } from 'src/module/event/domain/events';
import { NotificationRepository } from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/models';

/**
 * 일정 취소/삭제 알림 핸들러
 *
 * EventCancelledEvent를 수신하여 참여자에게 인앱 알림을 생성합니다.
 * - E3 (사용자 삭제): 삭제자 제외, "참여 중인 일정이 취소됐어요"
 * - E4 (시스템 자동 취소): 전원, "인원 부족으로 일정이 취소됐어요"
 */
@Injectable()
export class EventCancelledNotificationHandler implements OnModuleInit {
  private readonly logger = new Logger(EventCancelledNotificationHandler.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventCancelledEvent) => void this.handle(event),
      EventCancelledEvent.name,
    );
  }

  async handle(event: EventCancelledEvent): Promise<void> {
    const {
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
      this.logger.log('알림 대상 없음');
      return;
    }

    const notificationTitle = isSystemCancel
      ? '📅 인원 부족으로 일정이 취소됐어요'
      : '📅 참여 중인 일정이 취소됐어요';

    const subtitle = isSystemCancel
      ? `${title} · 참여자 ${participantCount}명 (최소 2명 필요)`
      : `${title} · ${formatKoreanDateTime(eventTime)}`;

    const notifications = targetUserIds.map((userId) =>
      Notification.create({
        userId,
        type: NotificationType.create('MEETING'),
        title: notificationTitle,
        subtitle,
      }),
    );

    await this.notificationRepository.saveBatch(notifications);

    this.logger.log(
      `일정 취소 알림 저장 완료: ${targetUserIds.length}명 (${isSystemCancel ? '시스템 취소' : '사용자 삭제'})`,
    );
  }
}
