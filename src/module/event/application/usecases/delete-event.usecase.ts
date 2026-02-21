import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';
import { DeleteEventDto } from '../dtos';
import { EventQueueService } from '../../infra/services';

@Injectable()
export class DeleteEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventQueueService: EventQueueService,
  ) {}

  async execute(dto: DeleteEventDto): Promise<void> {
    // 1. 일정 조회
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        errorCode: 'EVENT_NOT_FOUND',
        id: dto.eventId,
      });
    }

    // 2. 삭제 가능 여부 검증 (도메인에서 상태/권한 검증)
    event.validateDeletion(dto.userId);

    // 3. 삭제 알림 이벤트 등록
    event.markAsDeleted(dto.userId);

    // 4. 큐 작업 취소
    await this.eventQueueService.cancelParticipantCheck(dto.eventId);

    // 5. 삭제 (인프라 레이어에서 도메인 이벤트 발행)
    await this.eventRepository.delete(event);
  }
}
