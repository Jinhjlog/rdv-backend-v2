import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ParticipantDepartedEvent } from '../../../event/domain/events';
import { CreateLocationTrackingUseCase } from '../usecases';

/**
 * 참여자 출발 이벤트 핸들러
 *
 * ParticipantDepartedEvent를 수신하여 LocationTracking 스냅샷을 생성합니다.
 * - 출발한 참여자의 위치 추적 정보 초기화
 */
@Injectable()
export class ParticipantDepartedEventHandler implements OnModuleInit {
  private readonly logger = new Logger(ParticipantDepartedEventHandler.name);

  constructor(
    private readonly createLocationTrackingUseCase: CreateLocationTrackingUseCase,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: ParticipantDepartedEvent) => void this.handle(event),
      ParticipantDepartedEvent.name,
    );
  }

  async handle(event: ParticipantDepartedEvent): Promise<void> {
    const { eventId, groupId, userId } = event.metadata;

    this.logger.log(
      `참여자 출발 이벤트 수신: eventId=${eventId}, groupId=${groupId}, userId=${userId}`,
    );

    try {
      await this.createLocationTrackingUseCase.execute({
        eventId,
        userId,
      });

      this.logger.log(
        `LocationTracking 스냅샷 생성 완료: eventId=${eventId}, userId=${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `LocationTracking 스냅샷 생성 실패: eventId=${eventId}, userId=${userId}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
    }
  }
}
