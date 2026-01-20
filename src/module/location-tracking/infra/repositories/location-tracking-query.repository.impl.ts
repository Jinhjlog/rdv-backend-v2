import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import {
  LocationTrackingQueryRepository,
  FindLocationsByEventParams,
} from '../../domain/repositories';
import { LocationTrackingQueryModel } from '../../domain/models';

/**
 * LocationTracking Query Repository 구현체
 *
 * 위치 추적 정보 조회 전용 레포지토리
 * Prisma를 사용하여 직접 조회하고 QueryModel로 변환
 */
@Injectable()
export class LocationTrackingQueryRepositoryImpl implements LocationTrackingQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 일정별 참여자 위치 목록 조회
   *
   * 해당 일정의 모든 위치 추적 정보를 반환
   * updated_at 기준 최신순 정렬
   */
  async findByEventId(
    params: FindLocationsByEventParams,
  ): Promise<LocationTrackingQueryModel[]> {
    const { eventId } = params;

    const locations = await this.prisma.location_trackings.findMany({
      where: { event_id: eventId },
      orderBy: { updated_at: 'desc' },
    });

    return locations.map((location) => ({
      userId: location.user_id,
      nickname: location.nickname,
      nameTag: location.name_tag,
      characterCode: location.character_code,
      latitude:
        location.latitude !== null ? location.latitude.toString() : undefined,
      longitude:
        location.longitude !== null ? location.longitude.toString() : undefined,
      lastUpdatedAt:
        location.updated_at !== null ? location.updated_at : undefined,
    }));
  }
}
