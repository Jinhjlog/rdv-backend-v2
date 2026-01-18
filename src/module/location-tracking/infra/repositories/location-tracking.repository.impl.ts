import { Injectable } from '@nestjs/common';
import { LocationTrackingRepository } from '../../domain/repositories';
import { LocationTracking } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { LocationTrackingMapper } from '../mappers';

/**
 * LocationTracking Repository 구현체
 *
 * 조회 최적화 테이블로 UPSERT 및 일정별 조회/삭제 기능 제공
 */
@Injectable()
export class LocationTrackingRepositoryImpl implements LocationTrackingRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 위치 정보 저장 (UPSERT)
   *
   * 트랜잭션 관리:
   * - UnitOfWork 컨텍스트 내부: 외부 트랜잭션 재사용
   * - UnitOfWork 없이 호출: 내부에서 새 트랜잭션 생성
   *
   * eventId + userId 조합으로 기존 레코드가 있으면 업데이트, 없으면 생성
   * 최초 생성 시 스냅샷 정보(nickname, nameTag, characterCode) 저장
   * 이후 업데이트 시에는 위치 정보(latitude, longitude)만 갱신
   */
  async save(entity: LocationTracking): Promise<void> {
    const data = LocationTrackingMapper.toPersistence(entity);

    await this.prisma.location_trackings.upsert({
      where: {
        id: entity.id.toString(),
      },
      update: {
        latitude: data.latitude,
        longitude: data.longitude,
        updated_at: data.updated_at,
      },
      create: data,
    });
  }

  /**
   * ID로 조회
   */
  async findById(id: string): Promise<LocationTracking | undefined> {
    const raw = await this.prisma.location_trackings.findUnique({
      where: { id },
    });
    if (!raw) {
      return undefined;
    }

    return LocationTrackingMapper.toDomain(raw);
  }

  async findByUserIdAndEventId(
    userId: string,
    eventId: string,
  ): Promise<LocationTracking | undefined> {
    const raw = await this.prisma.location_trackings.findUnique({
      where: { event_id_user_id: { event_id: eventId, user_id: userId } },
    });
    if (!raw) {
      return undefined;
    }

    return LocationTrackingMapper.toDomain(raw);
  }
}
