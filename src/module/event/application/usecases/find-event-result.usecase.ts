import { Injectable } from '@nestjs/common';
import { EventQueryService } from '../../domain/services';
import { FindEventResultDto } from '../dtos';
import { EventResultReadModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class FindEventResultUseCase {
  constructor(private readonly eventQueryService: EventQueryService) {}

  async execute(dto: FindEventResultDto): Promise<EventResultReadModel> {
    const { userId, eventId } = dto;

    const result = await this.eventQueryService.findEventResult({
      eventId,
      contextUserId: userId,
    });

    if (!result) {
      throw new EntityNotFoundException({
        entityName: 'EventResult',
        errorCode: 'EVENT_RESULT_NOT_FOUND',
        id: eventId,
      });
    }

    return result;
  }
}
