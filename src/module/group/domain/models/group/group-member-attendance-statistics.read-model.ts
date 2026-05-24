/** 멤버별 출석 통계 ReadModel */
export interface MemberAttendanceStatisticsReadModel {
  userId: string;
  nickname: string;
  arrivedCount: number;
  lateCount: number;
  absentCount: number;
  totalCount: number;
  attendanceRate: string;
}

/** 모임별 참여자 출석 통계 ReadModel */
export interface GroupMemberAttendanceStatisticsReadModel {
  groupId: string;
  members: MemberAttendanceStatisticsReadModel[];
}
