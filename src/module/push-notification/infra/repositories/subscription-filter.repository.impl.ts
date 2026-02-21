import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { notification_type } from '@prisma/client';
import { SubscriptionFilterRepository } from '../../domain/repositories';
import { AlertPushTypeCode } from '../../domain/constants';

@Injectable()
export class SubscriptionFilterRepositoryImpl implements SubscriptionFilterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSubscribedUserIdsByType(
    type: AlertPushTypeCode,
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
