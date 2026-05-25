import { Prisma, device_tokens as DeviceTokenPrisma } from '@prisma/client';
import { DeviceToken, DevicePlatform } from '../../domain/models';

/**
 * DeviceTokenMapper
 *
 * 영속성 계층의 DeviceToken을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class DeviceTokenMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param prismaModel Prisma 모델
   * @returns 도메인 Aggregate Root
   */
  static toDomain(prismaModel: DeviceTokenPrisma): DeviceToken {
    return DeviceToken.unsafeCreate({
      id: prismaModel.id,
      userId: prismaModel.user_id,
      token: prismaModel.token,
      platform: prismaModel.platform as DevicePlatform,
      deviceInfo:
        prismaModel.device_info !== null ? prismaModel.device_info : undefined,
      lastUsedAt: prismaModel.last_used_at,
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
    domainModel: DeviceToken,
  ): Prisma.device_tokensUncheckedCreateInput {
    return {
      id: domainModel.id.toString(),
      user_id: domainModel.userId,
      token: domainModel.token,
      platform: domainModel.platform,
      device_info: domainModel.deviceInfo ?? null,
      last_used_at: domainModel.lastUsedAt,
      created_at: domainModel.createdAt,
      updated_at: domainModel.updatedAt,
    };
  }
}
