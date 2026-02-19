import { Injectable } from '@nestjs/common';
import { notification_type } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import {
  NotificationQueryRepository,
  FindNotificationListParams,
} from '../../domain/repositories';
import { NotificationListItemQueryModel } from '../../domain/models';
import { NotificationType } from '../../domain/models';

@Injectable()
export class NotificationQueryRepositoryImpl implements NotificationQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findList(
    params: FindNotificationListParams,
  ): Promise<NotificationListItemQueryModel[]> {
    const results = await this.prisma.notifications.findMany({
      where: {
        user_id: params.userId,
        ...(params.type && {
          type: notification_type[params.type],
        }),
        ...(params.cursor && {
          OR: [
            { created_at: { lt: new Date(params.cursor.createdAt) } },
            {
              created_at: new Date(params.cursor.createdAt),
              id: { lt: params.cursor.id },
            },
          ],
        }),
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: params.limit,
    });

    return results.map((raw) => ({
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
    }));
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notifications.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }
}
