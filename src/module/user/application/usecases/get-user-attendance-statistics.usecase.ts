import { Injectable } from '@nestjs/common';
import { AttendanceStatisticsQueryRepository } from '../../domain/repositories';
import { GetUserAttendanceStatisticsDto } from '../dtos/get-user-attendance-statistics.dto';
import { AttendanceStatisticsQueryModel } from '../../domain/models';

@Injectable()
export class GetUserAttendanceStatisticsUseCase {
  constructor(
    private readonly attendanceStatisticsQueryRepository: AttendanceStatisticsQueryRepository,
  ) {}

  async execute(
    dto: GetUserAttendanceStatisticsDto,
  ): Promise<AttendanceStatisticsQueryModel> {
    return this.attendanceStatisticsQueryRepository.findByUserId(dto.userId);
  }
}
