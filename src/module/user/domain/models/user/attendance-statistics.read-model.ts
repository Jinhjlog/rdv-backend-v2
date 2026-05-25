/** 사용자 출석 통계 ReadModel */
export interface AttendanceStatisticsReadModel {
  userId: string;
  arrivedCount: number;
  lateCount: number;
  absentCount: number;
  totalCount: number;
  attendanceRate: string;
}
