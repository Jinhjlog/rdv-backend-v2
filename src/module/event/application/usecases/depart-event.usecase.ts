import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';
import { DepartEventDto } from '../dtos';

@Injectable()
export class DepartEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(dto: DepartEventDto): Promise<void> {
    // 1. 일정 조회
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        errorCode: 'EVENT_NOT_FOUND',
        id: dto.eventId,
      });
    }

    // 2. 참여자 출발 처리 (도메인 레벨에서 상태 검증)
    event.departParticipant(dto.userId);

    // 3. 저장
    await this.eventRepository.save(event);
  }
}
