import { Injectable } from '@nestjs/common';
import { EventQueryService } from '../../domain/services';
import { FindEventListDto } from '../dtos';
import { EventListReadModel } from '../../domain/models';

@Injectable()
export class FindEventListUseCase {
  constructor(private readonly eventQueryService: EventQueryService) {}

  async execute(dto: FindEventListDto): Promise<EventListReadModel[]> {
    const { userId, groupId, status } = dto;

    const events = await this.eventQueryService.findList({
      contextUserId: userId,
      groupId,
      status,
    });
    return events;
  }
}
