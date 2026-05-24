import { Injectable } from '@nestjs/common';
import { EventQueryService } from '../../domain/services';
import { FindActiveEventDto } from '../dtos';
import { ActiveEventReadModel } from '../../domain/models';

export interface FindActiveEventResult {
  hasActiveEvent: boolean;
  event?: ActiveEventReadModel;
}

@Injectable()
export class FindActiveEventUseCase {
  constructor(private readonly eventQueryService: EventQueryService) {}

  async execute(dto: FindActiveEventDto): Promise<FindActiveEventResult> {
    const { userId, groupId } = dto;

    const event = await this.eventQueryService.findActiveEventByGroupId({
      groupId,
      contextUserId: userId,
    });

    return {
      hasActiveEvent: !!event,
      event,
    };
  }
}
