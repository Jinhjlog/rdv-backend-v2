import {
  Prisma,
  notification_subscriptions as NotificationSubscriptionPrisma,
} from '@prisma/client';
import { NotificationSubscription } from '../../domain/models/notification-subscription/notification-subscription';
import { NotificationType } from '../../domain/models';

export class NotificationSubscriptionMapper {
  static toDomain(
    raw: NotificationSubscriptionPrisma,
  ): NotificationSubscription {
    return NotificationSubscription.unsafeCreate({
      id: raw.id,
      userId: raw.user_id,
      type: NotificationType.unsafeCreate(raw.type),
      isSubscribed: raw.is_subscribed,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(
    domain: NotificationSubscription,
  ): Prisma.notification_subscriptionsUncheckedCreateInput {
    return {
      id: domain.id.toString(),
      user_id: domain.userId,
      type: domain.typeValue,
      is_subscribed: domain.isSubscribed,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }
}
