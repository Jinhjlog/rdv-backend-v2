import { Injectable } from '@nestjs/common';
import { DeviceTokenRepository } from '../../domain/repositories';
import { DeviceToken } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { DeviceTokenMapper } from '../mappers';
import { DomainEvents } from '@lib/domain/events/domain-events';

@Injectable()
export class DeviceTokenRepositoryImpl implements DeviceTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: DeviceToken): Promise<void> {
    const data = DeviceTokenMapper.toPersistence(entity);

    await this.prisma.device_tokens.upsert({
      where: { id: entity.id.toString() },
      update: data,
      create: data,
    });

    // Domain Events 발행
    if (entity.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(entity.id);
    }
  }

  async findById(id: string): Promise<DeviceToken | undefined> {
    const raw = await this.prisma.device_tokens.findUnique({
      where: { id },
    });

    if (!raw) {
      return undefined;
    }

    return DeviceTokenMapper.toDomain(raw);
  }

  async findByToken(token: string): Promise<DeviceToken | undefined> {
    const raw = await this.prisma.device_tokens.findUnique({
      where: { token },
    });

    if (!raw) {
      return undefined;
    }

    return DeviceTokenMapper.toDomain(raw);
  }

  async findByUserId(userId: string): Promise<DeviceToken[]> {
    const raws = await this.prisma.device_tokens.findMany({
      where: { user_id: userId },
    });

    return raws.map((raw) => DeviceTokenMapper.toDomain(raw));
  }

  async findByUserIds(userIds: string[]): Promise<DeviceToken[]> {
    if (userIds.length === 0) {
      return [];
    }

    const raws = await this.prisma.device_tokens.findMany({
      where: { user_id: { in: userIds } },
    });

    return raws.map((raw) => DeviceTokenMapper.toDomain(raw));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.device_tokens.delete({
      where: { id },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.device_tokens.deleteMany({
      where: { token },
    });
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

  async deleteStaleTokens(staleDate: Date): Promise<number> {
    const result = await this.prisma.device_tokens.deleteMany({
      where: {
        last_used_at: { lt: staleDate },
      },
    });

    return result.count;
  }
}
