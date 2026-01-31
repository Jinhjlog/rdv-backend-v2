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
      update: {
        latest_version: data.latest_version,
        min_required_version: data.min_required_version,
        store_url: data.store_url,
        updated_at: data.updated_at,
      },
      create: data,
    });
  }
}
