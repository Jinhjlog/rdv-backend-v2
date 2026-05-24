import { Injectable } from '@nestjs/common';
import { EventQueryService } from '../../domain/services';
import { FindEventDetailDto } from '../dtos';
import { EventDetailReadModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class FindEventDetailUseCase {
  constructor(private readonly eventQueryService: EventQueryService) {}

  async execute(dto: FindEventDetailDto): Promise<EventDetailReadModel> {
    const { userId, eventId } = dto;

    const event = await this.eventQueryService.findDetail({
      eventId,
      contextUserId: userId,
    });
    if (!event) {
      throw new EntityNotFoundException({
        entityName: 'Event',
        id: eventId,
        errorCode: 'EVENT_NOT_FOUND',
      });
    }

    return event;
  }
}
