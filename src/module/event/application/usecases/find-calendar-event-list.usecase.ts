import { Injectable } from '@nestjs/common';
import { EventQueryRepository } from '../../domain/repositories';
import { FindCalendarEventListDto } from '../dtos';
import { CalendarEventListItemQueryModel } from '../../domain/models';

@Injectable()
export class FindCalendarEventListUseCase {
  constructor(private readonly eventQueryRepository: EventQueryRepository) {}

  async execute(
    dto: FindCalendarEventListDto,
  ): Promise<CalendarEventListItemQueryModel[]> {
    const { userId, date } = dto;

    return this.eventQueryRepository.findCalendarEventList({
      userId,
      date,
    });
  }
}
