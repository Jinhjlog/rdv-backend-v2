import {
  GroupListReadModel,
  GroupDetailReadModel,
  GroupMemberAttendanceStatisticsReadModel,
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

/** 모임 조회용 QueryService */
export abstract class GroupQueryService {
  /** 모임 목록을 조회합니다. */
  abstract findList(params: FindGroupListParams): Promise<GroupListReadModel[]>;

  /** 모임 상세를 조회합니다. */
  abstract findDetail(
    params: FindGroupDetailParams,
  ): Promise<GroupDetailReadModel | undefined>;

  /** 모임별 멤버 출석 통계를 조회합니다. */
  abstract findMemberAttendanceStatistics(
    params: FindMemberAttendanceStatisticsParams,
  ): Promise<GroupMemberAttendanceStatisticsReadModel>;
}
