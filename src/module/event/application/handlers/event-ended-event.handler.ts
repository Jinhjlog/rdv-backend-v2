import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEndedEvent } from '../../domain/events';

/**
 * 일정 종료 이벤트 핸들러
 *
 * EventEndedEvent를 수신하여 부수 효과를 처리합니다:
 * - 출석 결과 저장 (TODO: EventResultRepository)
 * - 푸시 알림 발송 (TODO)
 * - 위치 추적 세션 종료 (TODO)
 */
@Injectable()
export class EventEndedEventHandler implements OnModuleInit {
  private readonly logger = new Logger(EventEndedEventHandler.name);

  constructor() {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventEndedEvent) => void this.handle(event),
      EventEndedEvent.name,
    );
  }

  async handle(event: EventEndedEvent): Promise<void> {
    const { eventId, groupId, results } = event.metadata;

    this.logger.log(
      `일정 종료 이벤트 수신: eventId=${eventId}, groupId=${groupId}, results=${results.length}건`,
    );

    // 출석 결과 로깅
    results.forEach((r) => {
      this.logger.log(`  - userId=${r.userId}, result=${r.result}`);
    });

    return Promise.resolve();

    // TODO: 1. 출석 결과 저장 (EventResultRepository)
    // await this.eventResultRepository.saveAll(eventId, results);

    // TODO: 2. 푸시 알림 발송 - "일정이 종료되었습니다. 출석 결과를 확인하세요"
    // await this.pushNotificationService.sendToUsers(participantUserIds, { ... });

    // TODO: 3. 위치 추적 세션 종료
    // await this.locationTrackingService.endSession(eventId);
  }
}
