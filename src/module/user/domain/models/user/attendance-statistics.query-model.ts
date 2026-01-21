/**
 * 사용자 출석 통계 QueryModel
 *
 * 개인별 출석률 조회 결과를 담는 모델입니다.
 * - 도착/지각/부재 횟수
 * - 전체 참여 횟수
 * - 출석률 (도착 횟수 / 전체 참여 횟수 × 100)
 */
export class AttendanceStatisticsQueryModel {
  /** 사용자 ID */
  userId: string;

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
