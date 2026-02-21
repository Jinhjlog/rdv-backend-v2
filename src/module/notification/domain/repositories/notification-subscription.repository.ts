import { NotificationTypeCode } from '../models';
import { NotificationSubscription } from '../models/notification-subscription/notification-subscription';

/**
 * NotificationSubscription 커맨드용 Repository
 *
 * 사용자별 알림 타입 구독 설정의 쓰기 작업을 처리합니다.
 */
export abstract class NotificationSubscriptionRepository {
  abstract save(entity: NotificationSubscription): Promise<void>;
  abstract saveBatch(entities: NotificationSubscription[]): Promise<void>;

  /** 특정 사용자의 특정 타입 구독 설정 조회 (커맨드 사이드 조회) */
  abstract findByUserIdAndType(
    userId: string,
    type: NotificationTypeCode,
  ): Promise<NotificationSubscription | undefined>;
}
