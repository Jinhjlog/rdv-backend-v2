import { NotificationTypeCode } from '../../domain/models';

export class UpdateNotificationSubscriptionDto {
  userId: string;
  type: NotificationTypeCode;
  isSubscribed: boolean;
}
