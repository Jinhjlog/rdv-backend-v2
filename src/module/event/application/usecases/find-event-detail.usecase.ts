import { Injectable } from '@nestjs/common';
import { EventQueryRepository } from '../../domain/repositories';
import { FindEventDetailDto } from '../dtos';
import { EventDetailQueryModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class FindEventDetailUseCase {
  constructor(private readonly eventQueryRepository: EventQueryRepository) {}

  async execute(dto: FindEventDetailDto): Promise<EventDetailQueryModel> {
    const { userId, eventId } = dto;

    const event = await this.eventQueryRepository.findDetail({
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
