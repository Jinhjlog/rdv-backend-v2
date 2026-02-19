import { Notification, NotificationType } from '../models';

/**
 * Notification 커맨드용 Repository
 *
 * 알림 생성, 수정 등 쓰기 작업을 처리합니다.
 */
export abstract class NotificationRepository {
  abstract save(notification: Notification): Promise<void>;
  abstract saveBatch(notifications: Notification[]): Promise<void>;
  abstract findById(id: string): Promise<Notification | undefined>;
  abstract markAllAsReadByUserId(
    userId: string,
    type?: NotificationType,
  ): Promise<number>;
}
