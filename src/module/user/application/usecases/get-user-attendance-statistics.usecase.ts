import { Injectable } from '@nestjs/common';
import { AttendanceStatisticsQueryService } from '../../domain/services';
import { GetUserAttendanceStatisticsDto } from '../dtos/get-user-attendance-statistics.dto';
import { AttendanceStatisticsReadModel } from '../../domain/models';

@Injectable()
export class GetUserAttendanceStatisticsUseCase {
  constructor(
    private readonly attendanceStatisticsQueryService: AttendanceStatisticsQueryService,
  ) {}

  async execute(
    dto: GetUserAttendanceStatisticsDto,
  ): Promise<AttendanceStatisticsReadModel> {
    return this.attendanceStatisticsQueryService.findByUserId(dto.userId);
  }
}
