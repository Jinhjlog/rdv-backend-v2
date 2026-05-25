export interface NotificationPayload {
  title: string;
  body: string;
}

export interface SendResult {
  successCount: number;
  failureCount: number;
  failureTokens: string[];
}

export interface SilentPushData {
  [key: string]: string;
}

/**
 * 푸시 알림 발송 Port
 *
 * 외부 푸시 알림 서비스(Firebase 등)와 통신하기 위한 추상화 계층입니다.
 *
 * - Production: FcmNotificationSenderAdapter (Firebase Cloud Messaging)
 * - Test: MockNotificationSenderAdapter (no-op)
 */
export abstract class NotificationSenderPort {
  /** 여러 디바이스 토큰으로 알림을 전송합니다. */
  abstract sendToMultipleDeviceTokens(
    tokens: string[],
    topic: string,
    notification: NotificationPayload,
    additionalData?: Record<string, string>,
  ): Promise<SendResult>;

  /** 사일런트 푸시를 여러 디바이스에 전송합니다. */
  abstract sendSilentPushToMultipleDevices(
    tokens: string[],
    data: SilentPushData,
  ): Promise<SendResult>;

  /** 단일 디바이스에 알림을 전송합니다. */
  abstract sendToDevice(
    token: string,
    topic: string,
    notification: NotificationPayload,
    additionalData?: Record<string, string>,
  ): Promise<SendResult>;
}
