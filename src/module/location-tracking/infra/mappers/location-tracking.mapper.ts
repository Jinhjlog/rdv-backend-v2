import {
  Prisma,
  location_trackings as LocationTrackingPrisma,
} from '@prisma/generated/client';
import { Coordinate } from '@lib/domain';
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
    let coordinate: Coordinate | undefined;
    if (
      prismaLocationTracking.latitude !== null &&
      prismaLocationTracking.longitude !== null &&
      prismaLocationTracking.updated_at !== null
    ) {
      coordinate = Coordinate.unsafeCreate({
        latitude: prismaLocationTracking.latitude.toString(),
        longitude: prismaLocationTracking.longitude.toString(),
        updatedAt: prismaLocationTracking.updated_at,
      });
    }
    return new LocationTracking({
      id: prismaLocationTracking.id,
      eventId: prismaLocationTracking.event_id,
      userId: prismaLocationTracking.user_id,
      nickname: prismaLocationTracking.nickname,
      nameTag: prismaLocationTracking.name_tag,
      characterCode: prismaLocationTracking.character_code,
      coordinate: coordinate,
    });
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
    let latitude: Prisma.Decimal | null = null;
    let longitude: Prisma.Decimal | null = null;
    let updatedAt: Date | null = null;

    if (domainLocationTracking.coordinate) {
      latitude = new Prisma.Decimal(domainLocationTracking.coordinate.latitude);
      longitude = new Prisma.Decimal(
        domainLocationTracking.coordinate.longitude,
      );
      updatedAt = domainLocationTracking.coordinate.updatedAt;
    }

    return {
      id: domainLocationTracking.id.toString(),
      events: { connect: { id: domainLocationTracking.eventId } },
      users: { connect: { id: domainLocationTracking.userId } },
      nickname: domainLocationTracking.nickname,
      name_tag: domainLocationTracking.nameTag,
      character_code: domainLocationTracking.characterCode,
      latitude: latitude,
      longitude: longitude,
      updated_at: updatedAt,
    };
  }
}
