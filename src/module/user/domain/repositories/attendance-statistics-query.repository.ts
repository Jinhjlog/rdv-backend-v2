import { AttendanceStatisticsQueryModel } from '../models';

/**
 * 출석 통계 QueryRepository 인터페이스
 *
 * 사용자 출석 통계 조회를 위한 Repository입니다.
 */
export abstract class AttendanceStatisticsQueryRepository {
  /**
   * 사용자별 출석 통계 조회
   *
   * @param userId 사용자 ID
   * @returns 출석 통계 (도착/지각/부재 횟수, 출석률)
   */
  abstract findByUserId(
    userId: string,
  ): Promise<AttendanceStatisticsQueryModel>;
}
