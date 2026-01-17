import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories';
import { User } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { UserMapper } from '../mappers';
import { DomainEvents } from '@lib/domain/events/domain-events';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: User): Promise<void> {
    const data = UserMapper.toPersistence(entity);

    await this.prisma.public_users.upsert({
      where: { id: entity.id.toString() },
      update: data,
      create: data,
    });

    // Domain Events 발행
    if (entity.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(entity.id);
    }
  }

  async findById(id: string): Promise<User | undefined> {
    const raw = await this.prisma.public_users.findUnique({
      where: { id },
    });

    if (!raw) {
      return undefined;
    }

    return UserMapper.toDomain(raw);
  }

  async findByDeviceId(deviceId: string): Promise<User | undefined> {
    const raw = await this.prisma.public_users.findUnique({
      where: { device_id: deviceId },
    });

    if (!raw) {
      return undefined;
    }

    return UserMapper.toDomain(raw);
  }
}
