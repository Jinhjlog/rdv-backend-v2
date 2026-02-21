import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { AttendanceResult } from 'src/module/event/domain/models/event/event-result';
import { EventEndedEvent } from 'src/module/event/domain/events';
import { NotificationRepository } from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/models';

/**
 * 출석 결과 알림 핸들러
 *
 * EventEndedEvent를 수신하여 참여자 전원에게 인앱 알림을 생성합니다.
 * - E6: 📊 출석 결과가 나왔어요 · {일정 제목} · 도착 {N}명 · 지각 {N}명
 */
@Injectable()
export class EventEndedNotificationHandler implements OnModuleInit {
  private readonly logger = new Logger(EventEndedNotificationHandler.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventEndedEvent) => void this.handle(event),
      EventEndedEvent.name,
    );
  }

  async handle(event: EventEndedEvent): Promise<void> {
    const { eventId, title, results } = event.metadata;

    const participantUserIds = results.map((r) => r.userId);

    if (participantUserIds.length === 0) {
      this.logger.log('알림 대상 없음');
      return;
    }

    const arrivedCount = results.filter(
      (r) => r.result === AttendanceResult.ARRIVED,
    ).length;
    const lateCount = results.filter(
      (r) => r.result === AttendanceResult.LATE,
    ).length;

    const subtitle = `${title} · 도착 ${arrivedCount}명 · 지각 ${lateCount}명`;

    const notifications = participantUserIds.map((userId) =>
      Notification.create({
        userId,
        type: NotificationType.create('MEETING'),
        title: '📊 출석 결과가 나왔어요',
        subtitle,
      }),
    );

    await this.notificationRepository.saveBatch(notifications);

    this.logger.log(
      `출석 결과 알림 저장 완료: eventId=${eventId}, ${participantUserIds.length}명`,
    );
  }
}
