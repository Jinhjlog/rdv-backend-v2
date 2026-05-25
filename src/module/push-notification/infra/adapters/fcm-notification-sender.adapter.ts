import { Injectable } from '@nestjs/common';
import { NotificationSenderService } from '@core/firebase/notification-sender.service';
import {
  NotificationSenderPort,
  NotificationPayload,
  SendResult,
  SilentPushData,
} from '../../application/ports';

@Injectable()
export class FcmNotificationSenderAdapter implements NotificationSenderPort {
  constructor(
    private readonly notificationSenderService: NotificationSenderService,
  ) {}

  async sendToMultipleDeviceTokens(
    tokens: string[],
    topic: string,
    notification: NotificationPayload,
    additionalData?: Record<string, string>,
  ): Promise<SendResult> {
    return this.notificationSenderService.sendToMultipleDeviceTokens(
      tokens,
      topic,
      notification,
      additionalData,
    );
  }

  async sendSilentPushToMultipleDevices(
    tokens: string[],
    data: SilentPushData,
  ): Promise<SendResult> {
    return this.notificationSenderService.sendSilentPushToMultipleDevices(
      tokens,
      data,
    );
  }

  async sendToDevice(
    token: string,
    topic: string,
    notification: NotificationPayload,
    additionalData?: Record<string, string>,
  ): Promise<SendResult> {
    return this.notificationSenderService.sendToMultipleDeviceTokens(
      [token],
      topic,
      notification,
      additionalData,
    );
  }
}
