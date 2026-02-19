import { Injectable } from '@nestjs/common';
import { notification_type } from '@prisma/client';
import { PrismaService } from '@core/database/prisma.service';
import { NotificationRepository } from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/models';
import { NotificationMapper } from '../mappers';

@Injectable()
export class NotificationRepositoryImpl implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(notification: Notification): Promise<void> {
    const data = NotificationMapper.toPersistence(notification);
    await this.prisma.notifications.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async saveBatch(notifications: Notification[]): Promise<void> {
    const data = notifications.map((notification) =>
      NotificationMapper.toPersistence(notification),
    );
    await this.prisma.notifications.createMany({ data });
  }

  async findById(id: string): Promise<Notification | undefined> {
    const raw = await this.prisma.notifications.findUnique({
      where: { id },
    });
    return raw ? NotificationMapper.toDomain(raw) : undefined;
  }

  async markAllAsReadByUserId(
    userId: string,
    type?: NotificationType,
  ): Promise<number> {
    const now = new Date();
    const result = await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false,
        ...(type && { type: type.value as notification_type }),
      },
      data: {
        is_read: true,
        read_at: now,
      },
    });
    return result.count;
  }
}
