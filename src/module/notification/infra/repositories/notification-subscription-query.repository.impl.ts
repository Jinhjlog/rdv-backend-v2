import { Injectable } from '@nestjs/common';
import { notification_type } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { NotificationSubscriptionQueryRepository } from '../../domain/repositories';
import { NotificationTypeCode } from '../../domain/models';
import { NotificationSubscriptionQueryModel } from '../../domain/models';

@Injectable()
export class NotificationSubscriptionQueryRepositoryImpl implements NotificationSubscriptionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(
    userId: string,
  ): Promise<NotificationSubscriptionQueryModel[]> {
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
