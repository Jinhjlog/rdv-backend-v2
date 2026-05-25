import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventStartedEvent } from '../../domain/events';
import { EventSchedulingPort } from '../ports';

/**
 * 일정 시작 이벤트 핸들러
 *
 * EventStartedEvent를 수신하여 일정 종료 스케줄링을 예약합니다.
 * 푸시 알림은 PushNotification 모듈, 위치 추적은 LocationTracking 모듈에서 각각 처리합니다.
 */
@Injectable()
export class EventStartedEventHandler implements OnModuleInit {
  private readonly logger = new Logger(EventStartedEventHandler.name);

  constructor(private readonly eventSchedulingPort: EventSchedulingPort) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventStartedEvent) => void this.handle(event),
      EventStartedEvent.name,
    );
  }

  async handle(event: EventStartedEvent): Promise<void> {
    const { eventId, groupId, participantUserIds, endTime } = event.metadata;

    this.logger.log(
      `일정 시작 이벤트 수신: eventId=${eventId}, groupId=${groupId}, participants=${participantUserIds.length}명`,
    );

    // 1. 일정 종료 스케줄링 예약
    const scheduled = await this.eventSchedulingPort.scheduleEventEnd(
      eventId,
      endTime,
    );

    if (scheduled) {
      this.logger.log(
        `일정 종료 스케줄링 예약 완료: eventId=${eventId}, endTime=${endTime.toISOString()}`,
      );
    } else {
      this.logger.error(`일정 종료 스케줄링 실패: eventId=${eventId}`);
    }
  }
}
