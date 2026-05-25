import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationSenderPort,
  NotificationPayload,
  SendResult,
  SilentPushData,
} from '../ports';
import { PushTokenRepository } from '../../domain/repositories';
import { SubscriptionFilterRepository } from '../../domain/repositories';
import { AlertPushTypeCode } from '../../domain/constants';
import { HandleFailedTokensUseCase } from '../usecases';

export interface PushDispatchResult {
  sent: boolean;
  successCount: number;
  failureCount: number;
}

/**
 * 푸시 전송 오케스트레이션 서비스
 *
 * 토큰 조회 → FCM 전송 → 실패 토큰 처리의 공통 흐름을 캡슐화합니다.
 * 핸들러는 "누구에게 보낼지"만 결정하고, 이 서비스에 전송을 위임합니다.
 */
@Injectable()
export class PushDispatchService {
  private readonly logger = new Logger(PushDispatchService.name);

  constructor(
    private readonly pushTokenRepository: PushTokenRepository,
    private readonly notificationSenderPort: NotificationSenderPort,
    private readonly handleFailedTokensUseCase: HandleFailedTokensUseCase,
    private readonly subscriptionFilterRepository: SubscriptionFilterRepository,
  ) {}

  /**
   * 구독 중인 유저에게 Alert 푸시 전송
   *
   * 알림 타입별 구독 필터링 → 토큰 조회 → FCM 전송 → 실패 토큰 처리
   */
  async sendAlertPushToSubscribers(params: {
    type: AlertPushTypeCode;
    topic: string;
    notification: NotificationPayload;
    data?: Record<string, string>;
  }): Promise<PushDispatchResult> {
    const subscribedUserIds =
      await this.subscriptionFilterRepository.findSubscribedUserIdsByType(
        params.type,
      );

    return this.sendAlertPush({
      userIds: subscribedUserIds,
      topic: params.topic,
      notification: params.notification,
      data: params.data,
    });
  }

  /**
   * 특정 유저 중 구독 중인 유저에게 Alert 푸시 전송
   *
   * 대상 유저 목록에서 구독 필터링 → 토큰 조회 → FCM 전송 → 실패 토큰 처리
   */
  async sendAlertPushToTargetSubscribers(params: {
    userIds: string[];
    type: AlertPushTypeCode;
    topic: string;
    notification: NotificationPayload;
    data?: Record<string, string>;
  }): Promise<PushDispatchResult> {
    const subscribedUserIds =
      await this.subscriptionFilterRepository.findSubscribedUserIdsAmong(
        params.userIds,
        params.type,
      );

    return this.sendAlertPush({
      userIds: subscribedUserIds,
      topic: params.topic,
      notification: params.notification,
      data: params.data,
    });
  }

  /**
   * Alert 푸시 전송 (알림 표시 O)
   */
  async sendAlertPush(params: {
    userIds: string[];
    topic: string;
    notification: NotificationPayload;
    data?: Record<string, string>;
  }): Promise<PushDispatchResult> {
    const tokens = await this.resolveTokens(params.userIds);
    if (tokens.length === 0) return this.noTargets();

    const response =
      await this.notificationSenderPort.sendToMultipleDeviceTokens(
        tokens,
        params.topic,
        params.notification,
        params.data,
      );

    await this.handleFailures(response);

    return this.toResult(response);
  }

  /**
   * Silent 푸시 전송 (알림 표시 X, 백그라운드 데이터 전달)
   */
  async sendSilentPush(params: {
    userIds: string[];
    data: SilentPushData;
  }): Promise<PushDispatchResult> {
    const tokens = await this.resolveTokens(params.userIds);
    if (tokens.length === 0) return this.noTargets();

    const response =
      await this.notificationSenderPort.sendSilentPushToMultipleDevices(
        tokens,
        params.data,
      );

    await this.handleFailures(response);

    return this.toResult(response);
  }

  private async resolveTokens(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];
    return this.pushTokenRepository.findTokensByUserIds(userIds);
  }

  private async handleFailures(response: SendResult): Promise<void> {
    if (response.failureTokens.length > 0) {
      await this.handleFailedTokensUseCase.execute(response.failureTokens);
    }
  }

  private noTargets(): PushDispatchResult {
    return { sent: false, successCount: 0, failureCount: 0 };
  }

  private toResult(response: SendResult): PushDispatchResult {
    return {
      sent: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  }
}
