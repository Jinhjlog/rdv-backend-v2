import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { SystemNotificationBroadcastedEvent } from '../../../notification/domain/events';
import { AlertPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 시스템 공지 브로드캐스트 푸시 핸들러
 *
 * SystemNotificationBroadcastedEvent를 수신하여 SYSTEM 알림 구독 중인 유저에게 FCM 푸시를 전송합니다.
 * sendPush=false인 경우 푸시 없이 종료합니다.
 */
@Injectable()
export class SystemNotificationPushHandler implements OnModuleInit {
  private readonly logger = new Logger(SystemNotificationPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

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

    const result = await this.pushDispatchService.sendAlertPushToSubscribers({
      type: AlertPushType.System,
      topic: 'system-notification',
      notification: { title, body: subtitle },
      data: { targetScreen: 'notifications' },
    });

    if (!result.sent) {
      this.logger.warn('시스템 공지 푸시 발송 대상 없음 (구독 중인 유저 없음)');
      return;
    }

    this.logger.log(
      `시스템 공지 푸시 발송 완료: 성공=${result.successCount}, 실패=${result.failureCount}`,
    );
  }
}
