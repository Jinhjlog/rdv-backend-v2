import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEndedEvent } from '../../domain/events';

/**
 * 일정 종료 이벤트 핸들러
 *
 * EventEndedEvent를 수신하여 출석 결과를 로깅합니다.
 * 푸시 알림은 PushNotification 모듈, 위치 추적 정리는 LocationTracking 모듈에서 각각 처리합니다.
 */
@Injectable()
export class EventEndedEventHandler implements OnModuleInit {
  private readonly logger = new Logger(EventEndedEventHandler.name);

  onModuleInit() {
    DomainEvents.register(
      (event: EventEndedEvent) => void this.handle(event),
      EventEndedEvent.name,
    );
  }

  handle(event: EventEndedEvent): void {
    const { eventId, groupId, results } = event.metadata;

    this.logger.log(
      `일정 종료 이벤트 수신: eventId=${eventId}, groupId=${groupId}, results=${results.length}건`,
    );

    results.forEach((r) => {
      this.logger.log(`  - userId=${r.userId}, result=${r.result}`);
    });
  }
}
