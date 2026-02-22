import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { EventStartedEvent } from 'src/module/event/domain/events';
import { NotificationRepository } from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/models';

/**
 * 일정 시작 시 인앱 알림 생성 핸들러
 *
 * EventStartedEvent를 수신하여 일정 참여자들에게 인앱 알림을 생성합니다.
 * 참여자들에게 "출발" 상태 변경을 유도하여 위치 공유를 시작하게 합니다.
 */
@Injectable()
export class EventStartedNotificationHandler implements OnModuleInit {
  private readonly logger = new Logger(EventStartedNotificationHandler.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventStartedEvent) => void this.handle(event),
      EventStartedEvent.name,
    );
  }

  async handle(event: EventStartedEvent): Promise<void> {
    const { eventId, groupName, title, participantUserIds } = event.metadata;

    if (participantUserIds.length === 0) {
      this.logger.log('알림 대상 없음');
      return;
    }

    const notifications = participantUserIds.map((userId) =>
      Notification.create({
        userId,
        type: NotificationType.create('MEETING'),
        title: '🚀 곧 약속 시간이에요!',
        subtitle: `${groupName} · ${title} · 출발 버튼을 눌러주세요`,
      }),
    );

    await this.notificationRepository.saveBatch(notifications);

    this.logger.log(
      `일정 시작 알림 저장 완료: eventId=${eventId}, ${participantUserIds.length}명`,
    );
  }
}
