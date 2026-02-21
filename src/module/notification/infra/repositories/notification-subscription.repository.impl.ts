import { Injectable } from '@nestjs/common';
import { notification_type } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { NotificationSubscriptionRepository } from '../../domain/repositories';
import { NotificationTypeCode } from '../../domain/models';
import { NotificationSubscription } from '../../domain/models/notification-subscription/notification-subscription';
import { NotificationSubscriptionMapper } from '../mappers/notification-subscription.mapper';

@Injectable()
export class NotificationSubscriptionRepositoryImpl implements NotificationSubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: NotificationSubscription): Promise<void> {
    const data = NotificationSubscriptionMapper.toPersistence(entity);
    await this.prisma.notification_subscriptions.upsert({
      where: { id: data.id },
      create: data,
      update: {
        is_subscribed: data.is_subscribed,
        updated_at: data.updated_at,
      },
    });
  }

  async saveBatch(entities: NotificationSubscription[]): Promise<void> {
    const data = entities.map((entity) =>
      NotificationSubscriptionMapper.toPersistence(entity),
    );
    await this.prisma.$transaction(
      data.map((d) =>
        this.prisma.notification_subscriptions.upsert({
          where: { id: d.id as string },
          create: d,
          update: {
            is_subscribed: d.is_subscribed,
            updated_at: d.updated_at,
          },
        }),
      ),
    );
  }

  async findByUserIdAndType(
    userId: string,
    type: NotificationTypeCode,
  ): Promise<NotificationSubscription | undefined> {
    const row = await this.prisma.notification_subscriptions.findUnique({
      where: {
        user_id_type: {
          user_id: userId,
          type: type as notification_type,
        },
      },
    });
    return row ? NotificationSubscriptionMapper.toDomain(row) : undefined;
  }
}
