import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { DistanceCalculatorService } from '../../domain/services';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';
import { Coordinate } from '@lib/domain';
import { ArriveEventDto } from '../dtos';

const ARRIVAL_RADIUS_METERS = 50;

@Injectable()
export class ArriveEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(dto: ArriveEventDto): Promise<void> {
    // 1. 좌표 유효성 검증
    const userCoordinate = Coordinate.create({
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    // 2. 일정 조회
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        errorCode: 'EVENT_NOT_FOUND',
        id: dto.eventId,
      });
    }

    // 3. 위치 검증 (50m 이내)
    const distance = DistanceCalculatorService.calculateDistance(
      parseFloat(userCoordinate.latitude),
      parseFloat(userCoordinate.longitude),
      parseFloat(event.location.latitude),
      parseFloat(event.location.longitude),
    );

    if (distance > ARRIVAL_RADIUS_METERS) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: `도착 지점으로부터 ${Math.round(distance)}m 떨어져 있습니다. ${ARRIVAL_RADIUS_METERS}m 이내에서 도착 처리할 수 있습니다.`,
        errorCode: 'ARRIVAL_LOCATION_TOO_FAR',
      });
    }

    // 4. 참여자 도착 처리 (도메인 레벨에서 상태 검증)
    event.arriveParticipant(dto.userId);

    // 5. 저장
    await this.eventRepository.save(event);
  }
}
