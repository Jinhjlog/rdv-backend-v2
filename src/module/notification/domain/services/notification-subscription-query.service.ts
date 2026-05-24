import { NotificationTypeCode } from '../models';
import { NotificationSubscriptionReadModel } from '../models';

/** 알림 구독 설정 조회용 QueryService */
export abstract class NotificationSubscriptionQueryService {
  /** 사용자의 전체 구독 설정을 조회합니다. */
  abstract findByUserId(
    userId: string,
  ): Promise<NotificationSubscriptionReadModel[]>;

  /** 특정 타입을 구독 중인 유저 ID 목록을 조회합니다 (푸시 전송 시 필터링용). */
  abstract findSubscribedUserIdsByType(
    type: NotificationTypeCode,
  ): Promise<string[]>;
}
