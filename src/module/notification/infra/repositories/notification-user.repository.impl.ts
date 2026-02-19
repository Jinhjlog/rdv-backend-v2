import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { NotificationUserRepository } from '../../domain/repositories';

@Injectable()
export class NotificationUserRepositoryImpl implements NotificationUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllIds(): Promise<string[]> {
    const users = await this.prisma.public_users.findMany({
      select: { id: true },
    });

    return users.map((u) => u.id);
  }
}
