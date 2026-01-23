import { Injectable } from '@nestjs/common';
import { EventQueryRepository } from '../../domain/repositories';
import { FindActiveEventDto } from '../dtos';
import { ActiveEventQueryModel } from '../../domain/models';

export interface FindActiveEventResult {
  hasActiveEvent: boolean;
  event?: ActiveEventQueryModel;
}

@Injectable()
export class FindActiveEventUseCase {
  constructor(private readonly eventQueryRepository: EventQueryRepository) {}

  async execute(dto: FindActiveEventDto): Promise<FindActiveEventResult> {
    const { userId, groupId } = dto;

    const event = await this.eventQueryRepository.findActiveEventByGroupId({
      groupId,
      contextUserId: userId,
    });

    return {
      hasActiveEvent: !!event,
      event,
    };
  }
}
