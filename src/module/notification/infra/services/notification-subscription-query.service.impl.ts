import { Injectable } from '@nestjs/common';
import { notification_type } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { NotificationSubscriptionQueryService } from '../../domain/services';
import { NotificationTypeCode } from '../../domain/models';
import { NotificationSubscriptionReadModel } from '../../domain/models';

@Injectable()
export class NotificationSubscriptionQueryServiceImpl implements NotificationSubscriptionQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(
    userId: string,
  ): Promise<NotificationSubscriptionReadModel[]> {
    const rows = await this.prisma.notification_subscriptions.findMany({
      where: { user_id: userId },
    });

    return rows.map((row) => ({
      type: row.type,
      isSubscribed: row.is_subscribed,
    }));
  }

  async findSubscribedUserIdsByType(
    type: NotificationTypeCode,
  ): Promise<string[]> {
    const rows = await this.prisma.notification_subscriptions.findMany({
      where: {
        type: type as notification_type,
        is_subscribed: true,
      },
      select: { user_id: true },
    });
    return rows.map((row) => row.user_id);
  }
}
