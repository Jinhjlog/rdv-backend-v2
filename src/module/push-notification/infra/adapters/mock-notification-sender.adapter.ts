import { Injectable } from '@nestjs/common';
import {
  NotificationSenderPort,
  NotificationPayload,
  SendResult,
  SilentPushData,
} from '../../application/ports';

/**
 * 푸시 알림 발송 Mock Adapter
 *
 * 모든 발송 요청을 no-op으로 처리합니다.
 * E2E 테스트 환경에서 Firebase 연결 없이 동작합니다.
 */
@Injectable()
export class MockNotificationSenderAdapter implements NotificationSenderPort {
  sendToMultipleDeviceTokens(
    _tokens: string[],
    _topic: string,
    _notification: NotificationPayload,
    _additionalData?: Record<string, string>,
  ): Promise<SendResult> {
    return Promise.resolve({
      successCount: 0,
      failureCount: 0,
      failureTokens: [],
    });
  }

  sendSilentPushToMultipleDevices(
    _tokens: string[],
    _data: SilentPushData,
  ): Promise<SendResult> {
    return Promise.resolve({
      successCount: 0,
      failureCount: 0,
      failureTokens: [],
    });
  }

  sendToDevice(
    _token: string,
    _topic: string,
    _notification: NotificationPayload,
    _additionalData?: Record<string, string>,
  ): Promise<SendResult> {
    return Promise.resolve({
      successCount: 0,
      failureCount: 0,
      failureTokens: [],
    });
  }
}
