import { Injectable, Logger } from '@nestjs/common';
import { EventRepository, GroupRepository } from '../../domain/repositories';
import { CreateEventDto } from '../dtos';
import { BoundedString, Coordinate } from '@lib/domain';
import {
  DomainRuleViolationException,
  EntityNotFoundException,
} from '@shared/exception';
import {
  Event,
  EventParticipant,
  EventSchedule,
  EventStatus,
  Location,
} from '../../domain/models';
import { EventQueueService } from '../../infra/services';

@Injectable()
export class CreateEventUseCase {
  private logger = new Logger(CreateEventUseCase.name);

  private static readonly MAX_RECURRING_EVENTS_PER_GROUP = 3;

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly groupRepository: GroupRepository,
    private readonly eventQueueService: EventQueueService,
  ) {}

  async execute(dto: CreateEventDto): Promise<{ eventId: string }> {
    const coordinates = Coordinate.create({
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    const title = BoundedString.create(dto.title, {
      fieldName: 'title',
      minLength: 1,
      maxLength: 20,
    });
    const description = BoundedString.create(dto.description, {
      fieldName: 'description',
      minLength: 1,
      maxLength: 200,
    });
    const schedule = EventSchedule.create({
      eventTimeString: dto.eventTime,
    });
    const location = Location.create({
      address: dto.address,
      detail: BoundedString.create(dto.detail, {
        fieldName: 'location.detail',
        minLength: 1,
        maxLength: 50,
      }),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });

    const groupExists = await this.groupRepository.exists(dto.groupId);
    if (!groupExists) {
      throw new EntityNotFoundException({
        entityName: 'Group',
        errorCode: 'GROUP_NOT_FOUND',
        id: dto.groupId,
      });
    }

    const recurringEventCount =
      await this.eventRepository.findRecurringEventCountByGroupId(dto.groupId);
    if (
      recurringEventCount >= CreateEventUseCase.MAX_RECURRING_EVENTS_PER_GROUP
    ) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: `그룹당 모집중인 일정 이벤트는 최대 ${CreateEventUseCase.MAX_RECURRING_EVENTS_PER_GROUP}개까지 허용됩니다.`,
        errorCode: 'MAX_RECURRING_EVENTS_EXCEEDED',
      });
    }

    const event = new Event({
      groupId: dto.groupId,
      createdBy: dto.userId,
      title,
      description,
      schedule,
      location,
      status: EventStatus.RECRUITING,
      isParticipantChecked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [],
      results: [],
    });
    const participant = EventParticipant.create({
      eventId: event.id.toString(),
      userId: dto.userId,
    });

    event.addParticipant(participant);

    const scheduleSuccess =
      await this.eventQueueService.scheduleParticipantCheck(
        event.id.toString(),
        event.schedule.participantCheckTime,
      );
    if (!scheduleSuccess) {
      this.logger.error(
        `EVENT QUEUE ERROR - 이벤트 참가자 체크 스케줄링에 실패했습니다. eventId: ${event.id.toString()}`,
      );
      throw new Error(
        '이벤트 참가자 체크 스케줄링에 실패했습니다. 다시 시도해주세요.',
      );
    }

    try {
      await this.eventRepository.save(event);
    } catch (error) {
      this.logger.error(
        `DB ERROR - 이벤트 저장에 실패했습니다. groupId: ${dto.groupId}, userId: ${dto.userId}, title: ${dto.title}`,
        error,
      );
      await this.eventQueueService.cancelParticipantCheck(event.id.toString());
      throw new Error('이벤트 생성에 실패했습니다. 다시 시도해주세요.');
    }

    return { eventId: event.id.toString() };
  }
}
