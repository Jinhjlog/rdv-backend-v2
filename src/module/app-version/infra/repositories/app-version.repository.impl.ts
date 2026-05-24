import { Injectable } from '@nestjs/common';
import { AppVersionRepository } from '../../domain/repositories';
import { AppVersion, AppPlatform } from '../../domain/models';
import { AppVersionMapper } from '../mappers';
import { PrismaService } from '@core/database';

@Injectable()
export class AppVersionRepositoryImpl implements AppVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AppVersion[]> {
    const raws = await this.prisma.app_versions.findMany();

    return raws.map((raw) => AppVersionMapper.toDomain(raw));
  }

  async findByPlatform(platform: AppPlatform): Promise<AppVersion | undefined> {
    const raw = await this.prisma.app_versions.findUnique({
      where: { platform: platform.value },
    });

    if (!raw) {
      return undefined;
    }

    return AppVersionMapper.toDomain(raw);
  }

  async save(entity: AppVersion): Promise<void> {
    const data = AppVersionMapper.toPersistence(entity);

    await this.prisma.app_versions.upsert({
      where: { platform: entity.platform.value },
      update: data,
      create: data,
    });
  }
}
