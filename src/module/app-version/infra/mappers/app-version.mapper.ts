import { Prisma, app_versions as AppVersionPrisma } from '@prisma/client';
import { AppVersion, AppPlatform } from '../../domain/models';

/**
 * AppVersionMapper
 *
 * 영속성 계층의 AppVersion을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class AppVersionMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param prismaModel Prisma 모델
   * @returns 도메인 Aggregate Root
   */
  static toDomain(prismaModel: AppVersionPrisma): AppVersion {
    return new AppVersion({
      id: prismaModel.id,
      platform: AppPlatform.unsafeCreate(prismaModel.platform),
      latestVersion: prismaModel.latest_version,
      minRequiredVersion: prismaModel.min_required_version,
      storeUrl: prismaModel.store_url,
      createdAt: prismaModel.created_at,
      updatedAt: prismaModel.updated_at,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param domainModel 도메인 Aggregate Root
   * @returns Prisma 모델 (insert/update용)
   */
  static toPersistence(
    domainModel: AppVersion,
  ): Prisma.app_versionsUncheckedCreateInput {
    return {
      id: domainModel.id.toString(),
      platform: domainModel.platform.value,
      latest_version: domainModel.latestVersion,
      min_required_version: domainModel.minRequiredVersion,
      store_url: domainModel.storeUrl,
      created_at: domainModel.createdAt,
      updated_at: domainModel.updatedAt,
    };
  }
}
