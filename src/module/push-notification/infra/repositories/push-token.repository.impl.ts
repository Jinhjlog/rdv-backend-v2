import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { PushTokenRepository } from '../../domain/repositories';

@Injectable()
export class PushTokenRepositoryImpl implements PushTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTokenByUserId(userId: string): Promise<string | undefined> {
    const raw = await this.prisma.device_tokens.findFirst({
      where: { user_id: userId },
      orderBy: { last_used_at: 'desc' },
      select: { token: true },
    });

    return raw?.token;
  }

  async findTokensByUserIds(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) {
      return [];
    }

    const raws = await this.prisma.device_tokens.findMany({
      where: { user_id: { in: userIds } },
      select: { token: true },
    });

    return raws.map((r) => r.token);
  }

  async deleteByTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) {
      return;
    }

    await this.prisma.device_tokens.deleteMany({
      where: {
        token: { in: tokens },
      },
    });
  }
}
