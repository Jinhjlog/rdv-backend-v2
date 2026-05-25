import { AttendanceStatisticsReadModel } from '../models';

/** 출석 통계 조회용 QueryService */
export abstract class AttendanceStatisticsQueryService {
  /** 사용자별 출석 통계를 조회합니다. */
  abstract findByUserId(userId: string): Promise<AttendanceStatisticsReadModel>;
}
