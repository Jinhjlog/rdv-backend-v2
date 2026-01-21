import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { UpdateEventDto } from '../dtos';
import { BoundedString } from '@lib/domain';
import { EntityNotFoundException } from '@shared/exception';
import { EventSchedule } from '../../domain/models';
import { EventQueueService } from '../../infra/services';

@Injectable()
export class UpdateEventUseCase {
  private logger = new Logger(UpdateEventUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventQueueService: EventQueueService,
  ) {}

  async execute(dto: UpdateEventDto): Promise<{ eventId: string }> {
    // 1. 일정 조회
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        errorCode: 'EVENT_NOT_FOUND',
        id: dto.eventId,
      });
    }

    // 복구용 기존 시간 저장
    const originalParticipantCheckTime = event.schedule.participantCheckTime;

    // 2. 수정할 필드들 준비
    const updateParams: {
      title?: BoundedString;
      description?: BoundedString;
      schedule?: EventSchedule;
    } = {};

    if (dto.title !== undefined) {
      updateParams.title = BoundedString.create(dto.title, {
        fieldName: 'title',
        minLength: 1,
        maxLength: 20,
      });
    }

    if (dto.description !== undefined) {
      updateParams.description = BoundedString.create(dto.description, {
        fieldName: 'description',
        minLength: 1,
        maxLength: 200,
      });
    }

    if (dto.eventTime !== undefined) {
      updateParams.schedule = EventSchedule.create({
        eventTimeString: dto.eventTime,
      });
    }

    // 3. 도메인 메서드 호출 (권한 검증 포함) - 큐 변경 전에 먼저 검증
    event.update(dto.userId, updateParams);

    // 4. 시간 변경 시 큐 작업 재스케줄링
    if (updateParams.schedule) {
      await this.eventQueueService.cancelParticipantCheck(dto.eventId);

      const scheduleSuccess =
        await this.eventQueueService.scheduleParticipantCheck(
          dto.eventId,
          updateParams.schedule.participantCheckTime,
        );

      if (!scheduleSuccess) {
        await this.eventQueueService.scheduleParticipantCheck(
          dto.eventId,
          originalParticipantCheckTime,
        );

        this.logger.error(
          `EVENT QUEUE ERROR - 이벤트 참가자 체크 재스케줄링에 실패했습니다. eventId: ${dto.eventId}`,
        );
        throw new Error(
          '이벤트 참가자 체크 재스케줄링에 실패했습니다. 다시 시도해주세요.',
        );
      }
    }

    // 5. 저장
    try {
      await this.eventRepository.save(event);
    } catch (error) {
      this.logger.error(
        `DB ERROR - 이벤트 수정에 실패했습니다. eventId: ${dto.eventId}`,
        error,
      );

      if (updateParams.schedule) {
        await this.eventQueueService.cancelParticipantCheck(dto.eventId);
        await this.eventQueueService.scheduleParticipantCheck(
          dto.eventId,
          originalParticipantCheckTime,
        );
      }

      throw new Error('이벤트 수정에 실패했습니다. 다시 시도해주세요.');
    }

    return { eventId: dto.eventId };
  }
}
