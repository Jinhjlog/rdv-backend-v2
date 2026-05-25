import { NotificationSubscriptionReadModel } from '../../domain/models';
import { NotificationSubscription } from '../../domain/models/notification-subscription/notification-subscription';
import {
  NotificationSubscriptionResponseDto,
  NotificationSubscriptionsResponseDto,
} from '../dtos/response';

export class NotificationSubscriptionTransformer {
  /**
   * 구독 설정 쿼리 모델 목록 → Response DTO 변환
   */
  static toSubscriptionsResponse(
    subscriptions: NotificationSubscriptionReadModel[],
  ): NotificationSubscriptionsResponseDto {
    return {
      items: subscriptions.map((s) => ({
        type: s.type,
        isSubscribed: s.isSubscribed,
      })),
    };
  }

  /**
   * 단일 구독 설정 도메인 엔티티 → Response DTO 변환
   */
  static toSubscriptionResponse(
    subscription: NotificationSubscription,
  ): NotificationSubscriptionResponseDto {
    return {
      type: subscription.typeValue,
      isSubscribed: subscription.isSubscribed,
    };
  }
}
