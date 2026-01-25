import { Injectable } from '@nestjs/common';
import { EventQueryRepository } from '../../domain/repositories';
import { FindCalendarMarkedDatesDto } from '../dtos';

@Injectable()
export class FindCalendarMarkedDatesUseCase {
  constructor(private readonly eventQueryRepository: EventQueryRepository) {}

  async execute(dto: FindCalendarMarkedDatesDto): Promise<string[]> {
    const { userId, year, month } = dto;

    return this.eventQueryRepository.findCalendarMarkedDates({
      userId,
      year,
      month,
    });
  }
}
