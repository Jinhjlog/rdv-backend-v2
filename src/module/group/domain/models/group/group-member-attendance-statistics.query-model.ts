/**
 * 모임별 참여자 출석 통계 QueryModel
 *
 * 모임 내 각 멤버의 출석 현황을 담는 모델입니다.
 */
export interface MemberAttendanceStatisticsQueryModel {
  /** 사용자 ID */
  userId: string;

  /** 닉네임 */
  nickname: string;

  /** 도착 횟수 */
  arrivedCount: number;

  /** 지각 횟수 */
  lateCount: number;

  /** 부재 횟수 */
  absentCount: number;

  /** 전체 참여 횟수 */
  totalCount: number;

  /** 출석률 (%) - 소수점 2자리까지 (문자열) */
  attendanceRate: string;
}

/**
 * 모임별 참여자 출석 통계 전체 응답 QueryModel
 */
export interface GroupMemberAttendanceStatisticsQueryModel {
  /** 모임 ID */
  groupId: string;

  /** 멤버별 출석 통계 목록 */
  members: MemberAttendanceStatisticsQueryModel[];
}
