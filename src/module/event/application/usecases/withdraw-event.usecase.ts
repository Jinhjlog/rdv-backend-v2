import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';
import { WithdrawEventDto } from '../dtos';

@Injectable()
export class WithdrawEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(dto: WithdrawEventDto): Promise<void> {
    // 1. 일정 조회
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        errorCode: 'EVENT_NOT_FOUND',
        id: dto.eventId,
      });
    }

    // 2. 참여 철회 (도메인에서 상태 검증 및 참여자 제거)
    event.removeParticipant(dto.userId);

    // 3. 저장
    await this.eventRepository.save(event);
  }
}
