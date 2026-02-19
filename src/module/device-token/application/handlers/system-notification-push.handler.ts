import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { SystemNotificationBroadcastedEvent } from '../../../notification/domain/events';
import { DeviceTokenRepository } from '../../domain/repositories';
import { NotificationSenderService } from '@core/firebase/notification-sender.service';
import { HandleFailedTokensUseCase } from '../usecases';
import { AlertPushType } from '../../domain/constants';

/**
 * 시스템 공지 브로드캐스트 푸시 핸들러
 *
 * SystemNotificationBroadcastedEvent를 수신하여 전체 유저에게 FCM 푸시를 전송합니다.
 * sendPush=false인 경우 푸시 없이 종료합니다.
 */
@Injectable()
export class SystemNotificationPushHandler implements OnModuleInit {
  private readonly logger = new Logger(SystemNotificationPushHandler.name);

  constructor(
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly notificationSenderService: NotificationSenderService,
    private readonly handleFailedTokensUseCase: HandleFailedTokensUseCase,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: SystemNotificationBroadcastedEvent) => void this.handle(event),
      SystemNotificationBroadcastedEvent.name,
    );
  }

  async handle(event: SystemNotificationBroadcastedEvent): Promise<void> {
    const { title, subtitle, sendPush } = event.metadata;

    if (!sendPush) {
      this.logger.log('시스템 공지 푸시 미전송 (sendPush=false)');
      return;
    }

    // 1. 전체 FCM 토큰 조회
    const tokens = await this.deviceTokenRepository.findAllTokens();

    if (tokens.length === 0) {
      this.logger.warn('시스템 공지 푸시 발송 대상 없음 (등록된 토큰 없음)');
      return;
    }

    this.logger.log(`시스템 공지 푸시 발송 시작: ${tokens.length}개 토큰`);

    // 2. FCM 다중 기기 푸시 전송
    const response =
      await this.notificationSenderService.sendToMultipleDeviceTokens(
        tokens,
        'system-notification',
        { title, body: subtitle },
        {
          type: AlertPushType.System,
          targetScreen: 'notifications',
        },
      );

    this.logger.log(
      `시스템 공지 푸시 발송 완료: 성공=${response.successCount}, 실패=${response.failureCount}`,
    );

    // 3. 실패 토큰 정리
    if (response.failureTokens.length > 0) {
      await this.handleFailedTokensUseCase.execute(response.failureTokens);
    }
  }
}
