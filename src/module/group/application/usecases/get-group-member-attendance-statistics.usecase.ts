import { Injectable } from '@nestjs/common';
import { GroupQueryService } from '../../domain/services';
import { GroupMemberAttendanceStatisticsReadModel } from '../../domain/models';
import { GetGroupMemberAttendanceStatisticsDto } from '../dtos/get-group-member-attendance-statistics.dto';

@Injectable()
export class GetGroupMemberAttendanceStatisticsUseCase {
  constructor(private readonly groupQueryService: GroupQueryService) {}

  async execute(
    dto: GetGroupMemberAttendanceStatisticsDto,
  ): Promise<GroupMemberAttendanceStatisticsReadModel> {
    return this.groupQueryService.findMemberAttendanceStatistics({
      groupId: dto.groupId,
    });
  }
}
