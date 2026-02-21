import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { EventStartedEvent } from '../../../event/domain/events';
import { SilentPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 일정 시작 시 사일런트 푸시 발송 핸들러
 *
 * EventStartedEvent를 수신하여 일정 참여자들에게 사일런트 푸시를 발송합니다.
 */
@Injectable()
export class EventStartedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(EventStartedPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventStartedEvent) => void this.handle(event),
      EventStartedEvent.name,
    );
  }

  async handle(event: EventStartedEvent): Promise<void> {
    const { eventId, groupId, participantUserIds } = event.metadata;

    this.logger.log(
      `일정 시작 푸시 핸들러: eventId=${eventId}, participants=${participantUserIds.length}명`,
    );

    const result = await this.pushDispatchService.sendSilentPush({
      userIds: participantUserIds,
      data: {
        type: SilentPushType.EventStarted,
        eventId,
        groupId,
      },
    });

    if (!result.sent) {
      this.logger.warn(
        `푸시 발송 대상 없음: eventId=${eventId} (등록된 토큰 없음)`,
      );
      return;
    }

    this.logger.log(
      `사일런트 푸시 발송 완료: eventId=${eventId}, 성공=${result.successCount}, 실패=${result.failureCount}`,
    );
  }
}
