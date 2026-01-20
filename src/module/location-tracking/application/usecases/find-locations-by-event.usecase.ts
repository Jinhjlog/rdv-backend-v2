import { Injectable } from '@nestjs/common';
import { LocationTrackingQueryRepository } from '../../domain/repositories';
import { LocationTrackingQueryModel } from '../../domain/models';
import { FindLocationsByEventDto } from '../dtos';

/**
 * 일정별 위치 목록 조회 유즈케이스
 *
 * 진행중인 일정에서 참여자들의 실시간 위치를 조회합니다
 */
@Injectable()
export class FindLocationsByEventUseCase {
  constructor(
    private readonly locationTrackingQueryRepository: LocationTrackingQueryRepository,
  ) {}

  async execute(
    dto: FindLocationsByEventDto,
  ): Promise<LocationTrackingQueryModel[]> {
    const { eventId } = dto;

    const locations = await this.locationTrackingQueryRepository.findByEventId({
      eventId,
    });

    return locations;
  }
}
