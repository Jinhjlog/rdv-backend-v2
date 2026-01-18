import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '@shared/exception';
import { LocationTrackingRepository } from '../../domain/repositories';
import { RealTimeLocation } from '../../domain/models';
import { UpdateLocationDto } from '../dtos';

/**
 * 사용자 위치 갱신 유즈케이스
 *
 * 진행중인 일정에서 사용자의 현재 위치를 갱신합니다
 */
@Injectable()
export class UpdateLocationUseCase {
  constructor(
    private readonly locationTrackingRepository: LocationTrackingRepository,
  ) {}

  async execute(dto: UpdateLocationDto): Promise<void> {
    // 1. 기존 LocationTracking 조회
    const tracking =
      await this.locationTrackingRepository.findByUserIdAndEventId(
        dto.userId,
        dto.eventId,
      );
    if (!tracking) {
      throw new EntityNotFoundException({
        entityName: 'LocationTracking',
        id: dto.eventId,
        errorCode: 'LOCATION_TRACKING_NOT_FOUND',
      });
    }

    // 2. 새로운 RealTimeLocation Value Object 생성
    const newLocation = RealTimeLocation.create({
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    // 3. LocationTracking에 새 위치 설정 (도메인 로직)
    tracking.updateLocation(newLocation);

    // 4. 저장
    await this.locationTrackingRepository.save(tracking);
  }
}
