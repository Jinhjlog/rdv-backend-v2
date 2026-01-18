import {
  Prisma,
  location_trackings as LocationTrackingPrisma,
} from '@prisma/generated/client';
import { LocationTracking } from '../../domain/models';

/**
 * LocationTrackingMapper
 *
 * 영속성 계층의 LocationTracking을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 *
 * 조회 최적화 테이블로 User 조인 없이 단일 테이블로 완결
 */
export class LocationTrackingMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param {LocationTrackingPrisma} prismaLocationTracking Prisma 모델
   * @returns {LocationTracking} 도메인 Aggregate Root
   */
  static toDomain(
    prismaLocationTracking: LocationTrackingPrisma,
  ): LocationTracking {
    return new LocationTracking({
      id: prismaLocationTracking.id,
      eventId: prismaLocationTracking.event_id,
      userId: prismaLocationTracking.user_id,
      nickname: prismaLocationTracking.nickname,
      nameTag: prismaLocationTracking.name_tag,
      characterCode: prismaLocationTracking.character_code,
      latitude: this.decimalToString(prismaLocationTracking.latitude),
      longitude: this.decimalToString(prismaLocationTracking.longitude),
      updatedAt: prismaLocationTracking.updated_at,
    });
  }

  /**
   * Decimal 타입을 고정밀도 문자열로 변환
   * GPS 좌표의 정밀도를 보존하기 위해 8자리까지 유지
   */
  private static decimalToString(decimal: Prisma.Decimal | number): string {
    if (typeof decimal === 'number') {
      return decimal.toFixed(8);
    }
    return decimal.toFixed(8);
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param {LocationTracking} domainLocationTracking 도메인 Aggregate Root
   * @returns {Prisma.location_trackingsCreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(
    domainLocationTracking: LocationTracking,
  ): Prisma.location_trackingsCreateInput {
    return {
      id: domainLocationTracking.id.toString(),
      events: { connect: { id: domainLocationTracking.eventId } },
      users: { connect: { id: domainLocationTracking.userId } },
      nickname: domainLocationTracking.nickname,
      name_tag: domainLocationTracking.nameTag,
      character_code: domainLocationTracking.characterCode,
      latitude: domainLocationTracking.latitude,
      longitude: domainLocationTracking.longitude,
      updated_at: domainLocationTracking.updatedAt,
    };
  }
}
