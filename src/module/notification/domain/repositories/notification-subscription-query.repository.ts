import { NotificationTypeCode } from '../models';
import { NotificationSubscriptionQueryModel } from '../models/notification-subscription/notification-subscription.query-model';

/**
 * NotificationSubscription 조회용 Repository
 *
 * 구독 설정 목록 조회, 구독 중인 유저 필터링 등 읽기 작업을 처리합니다.
 */
export abstract class NotificationSubscriptionQueryRepository {
  /** 사용자의 전체 구독 설정 조회 */
  abstract findByUserId(
    userId: string,
  ): Promise<NotificationSubscriptionQueryModel[]>;

  /** 특정 타입을 구독 중인 유저 ID 목록 조회 (푸시 전송 시 필터링용) */
  abstract findSubscribedUserIdsByType(
    type: NotificationTypeCode,
  ): Promise<string[]>;
}
