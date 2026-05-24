import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { GroupLookupService } from '../../domain/services';
import { EntityNotFoundException } from '@shared/exception';
import { DeleteEventDto } from '../dtos';
import { EventSchedulingPort } from '../ports';

@Injectable()
export class DeleteEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly groupLookupService: GroupLookupService,
    private readonly eventSchedulingPort: EventSchedulingPort,
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

    // 3. 모임 이름 조회
    const groupName = await this.groupLookupService.findGroupNameById(
      event.groupId,
    );

    // 4. 삭제 알림 이벤트 등록
    event.markAsDeleted(dto.userId, groupName);

    // 5. 큐 작업 취소
    await this.eventSchedulingPort.cancelParticipantCheck(dto.eventId);

    // 6. 삭제 (인프라 레이어에서 도메인 이벤트 발행)
    await this.eventRepository.delete(event);
  }
}
