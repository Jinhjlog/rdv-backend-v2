import { Injectable } from '@nestjs/common';
import { GroupQueryRepository } from '../../domain/repositories';
import { GroupMemberAttendanceStatisticsQueryModel } from '../../domain/models';
import { GetGroupMemberAttendanceStatisticsDto } from '../dtos/get-group-member-attendance-statistics.dto';

@Injectable()
export class GetGroupMemberAttendanceStatisticsUseCase {
  constructor(private readonly groupQueryRepository: GroupQueryRepository) {}

  async execute(
    dto: GetGroupMemberAttendanceStatisticsDto,
  ): Promise<GroupMemberAttendanceStatisticsQueryModel> {
    return this.groupQueryRepository.findMemberAttendanceStatistics({
      groupId: dto.groupId,
    });
  }
}
