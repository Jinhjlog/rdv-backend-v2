import { Injectable } from '@nestjs/common';
import { EventQueryRepository } from '../../domain/repositories';
import { FindEventResultDto } from '../dtos';
import { EventResultQueryModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class FindEventResultUseCase {
  constructor(private readonly eventQueryRepository: EventQueryRepository) {}

  async execute(dto: FindEventResultDto): Promise<EventResultQueryModel> {
    const { userId, eventId } = dto;

    const result = await this.eventQueryRepository.findEventResult({
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
