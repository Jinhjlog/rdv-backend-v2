import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventStartedEvent } from '../../domain/events';
import { EventSchedulingPort } from '../ports';

/**
 * 일정 시작 이벤트 핸들러
 *
 * EventStartedEvent를 수신하여 부수 효과를 처리합니다:
 * - 일정 종료 스케줄링 예약
 * - 푸시 알림 발송 (TODO)
 * - 위치 추적 세션 시작 (TODO)
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

    // TODO: 2. 푸시 알림 발송 - "일정이 곧 시작됩니다! 출발 준비를 해주세요"
    // await this.pushNotificationService.sendToUsers(participantUserIds, { ... });

    // TODO: 3. 위치 추적 세션 시작
    // await this.locationTrackingService.startSession(eventId, participantUserIds);
  }
}
