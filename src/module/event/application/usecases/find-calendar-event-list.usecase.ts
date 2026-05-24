import { Injectable } from '@nestjs/common';
import { EventQueryService } from '../../domain/services';
import { FindCalendarEventListDto } from '../dtos';
import { CalendarEventListReadModel } from '../../domain/models';

@Injectable()
export class FindCalendarEventListUseCase {
  constructor(private readonly eventQueryService: EventQueryService) {}

  async execute(
    dto: FindCalendarEventListDto,
  ): Promise<CalendarEventListReadModel[]> {
    const { userId, date } = dto;

    return this.eventQueryService.findCalendarEventList({
      userId,
      date,
    });
  }
}
