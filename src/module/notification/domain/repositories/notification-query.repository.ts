import { FindManyParams } from '@shared/utils';
import { NotificationListItemQueryModel } from '../models';
import { NotificationType } from '../models';

/**
 * 알림 목록 조회 파라미터
 */
export interface FindNotificationListParams extends FindManyParams {
  userId: string;
  type?: NotificationType;
}

/**
 * Notification 조회용 Repository
 *
 * 알림 목록, 미읽음 개수 등 읽기 작업을 처리합니다.
 */
export abstract class NotificationQueryRepository {
  /**
   * 사용자의 알림 목록 조회 (커서 기반 페이지네이션)
   */
  abstract findList(
    params: FindNotificationListParams,
  ): Promise<NotificationListItemQueryModel[]>;

  /**
   * 사용자의 미읽음 알림 개수 조회
   */
  abstract countUnread(userId: string): Promise<number>;
}
