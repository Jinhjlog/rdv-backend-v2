import {
  GroupListItemQueryModel,
  GroupDetailQueryModel,
  GroupMemberAttendanceStatisticsQueryModel,
} from '../models';

export interface FindGroupListParams {
  contextUserId?: string;
}

export interface FindGroupDetailParams {
  groupId: string;
}

export interface FindMemberAttendanceStatisticsParams {
  groupId: string;
}

/**
 * Group 조회용 Repository
 *
 * 복잡한 조회 쿼리를 처리합니다.
 */
export abstract class GroupQueryRepository {
  abstract findList(
    params: FindGroupListParams,
  ): Promise<GroupListItemQueryModel[]>;

  abstract findDetail(
    params: FindGroupDetailParams,
  ): Promise<GroupDetailQueryModel | undefined>;

  abstract findMemberAttendanceStatistics(
    params: FindMemberAttendanceStatisticsParams,
  ): Promise<GroupMemberAttendanceStatisticsQueryModel>;
}
