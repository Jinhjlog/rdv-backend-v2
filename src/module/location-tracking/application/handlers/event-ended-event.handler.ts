import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEndedEvent } from '../../../event/domain/events';
import { LocationTrackingRepository } from '../../domain/repositories';

/**
 * 일정 종료 이벤트 핸들러
 *
 * EventEndedEvent를 수신하여 해당 일정의 모든 위치 추적 데이터를 삭제합니다.
 * - 일정 종료 시 위치 데이터 정리
 * - 프라이버시 보호 및 저장 공간 관리
 */
@Injectable()
export class EventEndedEventHandler implements OnModuleInit {
  private readonly logger = new Logger(EventEndedEventHandler.name);

  constructor(
    private readonly locationTrackingRepository: LocationTrackingRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventEndedEvent) => void this.handle(event),
      EventEndedEvent.name,
    );
  }

  async handle(event: EventEndedEvent): Promise<void> {
    const { eventId, groupId } = event.metadata;

    this.logger.log(
      `일정 종료 이벤트 수신: eventId=${eventId}, groupId=${groupId}`,
    );

    try {
      await this.locationTrackingRepository.deleteByEventId(eventId);

      this.logger.log(`위치 추적 데이터 삭제 완료: eventId=${eventId}`);
    } catch (error) {
      this.logger.error(
        `위치 추적 데이터 삭제 실패: eventId=${eventId}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
    }
  }
}
