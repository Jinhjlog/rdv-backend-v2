import { FindManyParams } from '@shared/utils';
import { NotificationListItemReadModel } from '../models';
import { NotificationType } from '../models';

export interface FindNotificationListParams extends FindManyParams {
  userId: string;
  type?: NotificationType;
}

/** 알림 조회용 QueryService */
export abstract class NotificationQueryService {
  /** 사용자의 알림 목록을 조회합니다 (커서 기반 페이지네이션). */
  abstract findList(
    params: FindNotificationListParams,
  ): Promise<NotificationListItemReadModel[]>;

  /** 사용자의 미읽음 알림 개수를 조회합니다. */
  abstract countUnread(userId: string): Promise<number>;
}
