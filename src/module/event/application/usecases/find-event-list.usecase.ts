import { Injectable } from '@nestjs/common';
import { EventQueryRepository } from '../../domain/repositories';
import { FindEventListDto } from '../dtos';
import { EventListItemQueryModel } from '../../domain/models';

@Injectable()
export class FindEventListUseCase {
  constructor(private readonly eventQueryRepository: EventQueryRepository) {}

  async execute(dto: FindEventListDto): Promise<EventListItemQueryModel[]> {
    const { userId, groupId, status } = dto;

    const events = await this.eventQueryRepository.findList({
      contextUserId: userId,
      groupId,
      status,
    });
    return events;
  }
}
