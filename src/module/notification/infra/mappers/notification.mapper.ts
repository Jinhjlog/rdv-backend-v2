import {
  Prisma,
  notifications as NotificationPrisma,
  notification_type,
} from '@prisma/client';
import { Notification, NotificationType } from '../../domain/models';

export class NotificationMapper {
  static toDomain(raw: NotificationPrisma): Notification {
    return new Notification({
      id: raw.id,
      userId: raw.user_id,
      type: NotificationType[raw.type],
      title: raw.title,
      subtitle: raw.subtitle,
      isRead: raw.is_read,
      referenceId: raw.reference_id ?? undefined,
      referenceType: raw.reference_type ?? undefined,
      readAt: raw.read_at ?? undefined,
      createdAt: raw.created_at,
    });
  }

  static toPersistence(
    domain: Notification,
  ): Prisma.notificationsUncheckedCreateInput {
    return {
      id: domain.id.toString(),
      user_id: domain.userId,
      type: notification_type[domain.type],
      title: domain.title,
      subtitle: domain.subtitle,
      is_read: domain.isRead,
      reference_id: domain.referenceId ?? null,
      reference_type: domain.referenceType ?? null,
      read_at: domain.readAt ?? null,
      created_at: domain.createdAt,
    };
  }
}
