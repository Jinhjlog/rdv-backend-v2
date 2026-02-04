import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { EventStartedEvent } from '../../../event/domain/events';
import { DeviceTokenRepository } from '../../domain/repositories';
import { NotificationSenderService } from '@core/firebase/notification-sender.service';
import { SilentPushType } from '../../domain/constants';

/**
 * 일정 시작 시 사일런트 푸시 발송 핸들러
 *
 * EventStartedEvent를 수신하여 일정 참여자들에게 사일런트 푸시를 발송합니다.
 */
@Injectable()
export class EventStartedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(EventStartedPushHandler.name);

  constructor(
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly notificationSenderService: NotificationSenderService,
  ) {}

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

    if (participantUserIds.length === 0) {
      this.logger.warn(`푸시 발송 대상 없음: eventId=${eventId} (참여자 0명)`);
      return;
    }

    // 1. 모든 참여자의 디바이스 토큰 조회
    const deviceTokens =
      await this.deviceTokenRepository.findByUserIds(participantUserIds);
    const tokens = deviceTokens.map((dt) => dt.token);

    if (tokens.length === 0) {
      this.logger.warn(
        `푸시 발송 대상 없음: eventId=${eventId} (등록된 토큰 없음)`,
      );
      return;
    }

    // 2. 사일런트 푸시 발송
    const response =
      await this.notificationSenderService.sendSilentPushToMultipleDevices(
        tokens,
        {
          type: SilentPushType.EventStarted,
          eventId,
          groupId,
        },
      );

    this.logger.log(
      `사일런트 푸시 발송 완료: eventId=${eventId}, 성공=${response.successCount}, 실패=${response.failureCount}`,
    );
  }
}
