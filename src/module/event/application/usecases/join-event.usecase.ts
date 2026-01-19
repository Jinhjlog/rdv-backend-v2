import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { EventParticipant } from '../../domain/models';
import { EventStatus } from '../../domain/models/event/event';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';
import { JoinEventDto } from '../dtos';

@Injectable()
export class JoinEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(dto: JoinEventDto): Promise<{ eventId: string }> {
    // 1. 일정 조회
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        errorCode: 'EVENT_NOT_FOUND',
        id: dto.eventId,
      });
    }

    // 2. 일정 상태 확인 (RECRUITING만 가능)
    if (event.status !== EventStatus.RECRUITING) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '모집중인 일정에만 참여할 수 있습니다.',
        errorCode: 'EVENT_NOT_RECRUITING',
      });
    }

    // 3. EventParticipant 생성 및 추가 (중복 참여는 도메인 레벨에서 검증)
    const participant = EventParticipant.create({
      eventId: dto.eventId,
      userId: dto.userId,
    });
    event.addParticipant(participant);

    // 4. 중복 일정 검증 (tracking_start_time ~ end_time)
    const hasConflict = await this.eventRepository.hasScheduleConflict(
      dto.userId,
      event.schedule.trackingStartTime,
      event.schedule.endTime,
      event.id.toString(),
    );
    if (hasConflict) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '다른 일정과 시간이 중복됩니다. 기존 일정 참여를 철회하세요.',
        errorCode: 'EVENT_TIME_CONFLICT',
      });
    }

    // 5. 저장
    await this.eventRepository.save(event);

    return { eventId: dto.eventId };
  }
}
