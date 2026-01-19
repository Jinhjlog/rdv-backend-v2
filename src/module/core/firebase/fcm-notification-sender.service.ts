import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';
import {
  NotificationSenderService,
  NotificationProps,
  SendResponse,
} from './notification-sender.service';
import { ArrayUtil } from '@shared/utils/array.util';

/**
 * FCM(Firebase Cloud Messaging)에서 제한하는 최대 토큰 수
 * @see https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-multiple-devices
 */
const FCM_MAX_TOKENS_PER_REQUEST = 500;

@Injectable()
export class FcmNotificationSenderService implements NotificationSenderService {
  private readonly logger = new Logger(FcmNotificationSenderService.name);

  async sendToMultipleDeviceTokens(
    tokens: string[],
    topic: string,
    notification: NotificationProps,
    additionalData?: Record<string, string>,
  ): Promise<SendResponse> {
    try {
      let totalSuccess = 0;
      let totalFailure = 0;
      const allFailureTokens: string[] = [];

      const tokenChunks = ArrayUtil.chunk(tokens, FCM_MAX_TOKENS_PER_REQUEST);

      for (const chunk of tokenChunks) {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: {
            topic,
            ...(additionalData || {}),
          },
          apns: {
            headers: {
              'apns-push-type': 'alert',
              'apns-priority': '10',
            },
            payload: {
              aps: {
                mutableContent: true,
                alert: {
                  title: notification.title,
                  body: notification.body,
                },
              },
            },
          },
          android: { priority: 'high' },
        });

        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        response.responses.forEach((res, index) => {
          if (!res.success) {
            allFailureTokens.push(chunk[index]);
          }
        });
      }

      return {
        successCount: totalSuccess,
        failureCount: totalFailure,
        failureTokens: allFailureTokens,
      };
    } catch (error) {
      this.logger.warn(`FCM 다중 발송 실패: ${error}`);
      throw new Error(`FCM 다중 발송 실패: ${error}`);
    }
  }

  async sendToTopic(
    topic: string,
    notification: NotificationProps,
  ): Promise<void> {
    try {
      await admin.messaging().send({
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        apns: {
          payload: { aps: { contentAvailable: true, mutableContent: true } },
        },
        android: { priority: 'high' },
      });
    } catch (error) {
      this.logger.warn(`FCM 토픽 발송 실패: ${error}`);
      throw new Error(`FCM 토픽 발송 실패: ${error}`);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      if (!token || token.trim().length === 0) {
        return false;
      }

      await admin.messaging().send(
        {
          token,
          notification: {
            title: 'Test',
            body: 'Test',
          },
        },
        true,
      );

      return true;
    } catch (error) {
      this.logger.debug(`FCM 토큰 검증 실패: ${token}, 오류: ${error}`);
      return false;
    }
  }

  async subscribeTokenToTopic(token: string, topic: string): Promise<void> {
    try {
      await admin.messaging().subscribeToTopic([token], topic);
      this.logger.debug(
        `✅ FCM 토픽 구독 성공: token=${token.slice(0, 10)}..., topic=${topic}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ FCM 토픽 구독 실패: token=${token.slice(0, 10)}..., topic=${topic}, 오류: ${error}`,
      );
      throw new Error(`FCM 토픽 구독 실패: topic=${topic}, 오류: ${error}`);
    }
  }

  async subscribeTokenToMultipleTopics(
    token: string,
    topics: string[],
  ): Promise<void> {
    for (const topic of topics) {
      try {
        await admin.messaging().subscribeToTopic([token], topic);
        this.logger.debug(
          `✅ FCM 토픽 구독 성공: token=${token.slice(0, 10)}..., topic=${topic}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ FCM 토픽 구독 실패: token=${token.slice(0, 10)}..., topic=${topic}, 오류: ${error}`,
        );
      }
    }
  }

  async unsubscribeTokenFromTopic(token: string, topic: string): Promise<void> {
    try {
      await admin.messaging().unsubscribeFromTopic([token], topic);
      this.logger.debug(
        `✅ FCM 토픽 구독해제 성공: token=${token.slice(0, 10)}..., topic=${topic}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ FCM 토픽 구독해제 실패: token=${token.slice(0, 10)}..., topic=${topic}, 오류: ${error}`,
      );
      throw new Error(`FCM 토픽 구독해제 실패: topic=${topic}, 오류: ${error}`);
    }
  }

  async unsubscribeTokenFromMultipleTopics(
    token: string,
    topics: string[],
  ): Promise<void> {
    for (const topic of topics) {
      try {
        await admin.messaging().unsubscribeFromTopic([token], topic);
        this.logger.debug(
          `✅ FCM 토픽 구독해제 성공: token=${token.slice(0, 10)}..., topic=${topic}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ FCM 토픽 구독해제 실패: token=${token.slice(0, 10)}..., topic=${topic}, 오류: ${error}`,
        );
      }
    }
  }
}
