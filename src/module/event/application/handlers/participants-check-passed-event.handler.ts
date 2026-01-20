import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ParticipantsCheckPassedEvent } from '../../domain/events';
import { EventQueueService } from '../../infra/services';

/**
 * 참여자 체크 통과 이벤트 핸들러
 *
 * ParticipantsCheckPassedEvent를 수신하여 위치 공유 시작 스케줄링을 예약합니다.
 */
@Injectable()
export class ParticipantsCheckPassedEventHandler implements OnModuleInit {
  private readonly logger = new Logger(
    ParticipantsCheckPassedEventHandler.name,
  );

  constructor(private readonly eventQueueService: EventQueueService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: ParticipantsCheckPassedEvent) => void this.handle(event),
      ParticipantsCheckPassedEvent.name,
    );
  }

  async handle(event: ParticipantsCheckPassedEvent): Promise<void> {
    const { eventId, participantCount, trackingStartTime } = event.metadata;

    this.logger.log(
      `참여자 체크 통과 이벤트 수신: eventId=${eventId}, participantCount=${participantCount}`,
    );

    // 위치 공유 시작 스케줄링 예약
    const scheduled = await this.eventQueueService.scheduleLocationSharingStart(
      eventId,
      trackingStartTime,
    );

    if (scheduled) {
      this.logger.log(
        `위치 공유 시작 스케줄링 예약 완료: eventId=${eventId}, trackingStartTime=${trackingStartTime.toISOString()}`,
      );
    } else {
      this.logger.error(`위치 공유 시작 스케줄링 실패: eventId=${eventId}`);
    }
  }
}
