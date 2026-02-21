import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { formatKoreanDateTime } from '@shared/utils';
import { EventCreatedEvent } from 'src/module/event/domain/events';
import { NotificationRepository } from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/models';

/**
 * 새 일정 생성 알림 핸들러
 *
 * EventCreatedEvent를 수신하여 모임 멤버(생성자 제외)에게 인앱 알림을 생성합니다.
 */
@Injectable()
export class EventCreatedNotificationHandler implements OnModuleInit {
  private readonly logger = new Logger(EventCreatedNotificationHandler.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventCreatedEvent) => void this.handle(event),
      EventCreatedEvent.name,
    );
  }

  async handle(event: EventCreatedEvent): Promise<void> {
    const { createdByUserId, groupMemberUserIds, title, eventTime } =
      event.metadata;

    const targetUserIds = groupMemberUserIds.filter(
      (id) => id !== createdByUserId,
    );

    if (targetUserIds.length === 0) {
      this.logger.log('알림 대상 없음 (모임 멤버가 생성자 본인뿐)');
      return;
    }

    const formattedTime = formatKoreanDateTime(eventTime);

    const notifications = targetUserIds.map((userId) =>
      Notification.create({
        userId,
        type: NotificationType.create('MEETING'),
        title: '📅 새 일정이 등록됐어요',
        subtitle: `${title} · ${formattedTime}`,
      }),
    );

    await this.notificationRepository.saveBatch(notifications);

    this.logger.log(`새 일정 생성 알림 저장 완료: ${targetUserIds.length}명`);
  }
}
