import { Injectable } from '@nestjs/common';
import { EventQueryService } from '../../domain/services';
import { FindCalendarMarkedDatesDto } from '../dtos';

@Injectable()
export class FindCalendarMarkedDatesUseCase {
  constructor(private readonly eventQueryService: EventQueryService) {}

  async execute(dto: FindCalendarMarkedDatesDto): Promise<string[]> {
    const { userId, year, month } = dto;

    return this.eventQueryService.findCalendarMarkedDates({
      userId,
      year,
      month,
    });
  }
}
