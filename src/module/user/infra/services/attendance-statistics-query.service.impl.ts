import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { AttendanceStatisticsQueryService } from '../../domain/services';
import { AttendanceStatisticsReadModel } from '../../domain/models';

/**
 * 출석 통계 QueryRepository 구현체
 *
 * Prisma를 사용하여 event_results 테이블에서 출석 통계를 집계합니다.
 */
@Injectable()
export class AttendanceStatisticsQueryServiceImpl implements AttendanceStatisticsQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<AttendanceStatisticsReadModel> {
    const countByResult = await this.prisma.event_results.groupBy({
      by: ['result'],
      where: { user_id: userId },
      _count: { _all: true },
    });

    // 결과가 없으면 모두 0으로 반환
    if (countByResult.length === 0) {
      return {
        userId,
        arrivedCount: 0,
        lateCount: 0,
        absentCount: 0,
        totalCount: 0,
        attendanceRate: '0.00',
      };
    }

    const arrivedCount =
      countByResult.find((r) => r.result === 'ARRIVED')?._count._all ?? 0;
    const lateCount =
      countByResult.find((r) => r.result === 'LATE')?._count._all ?? 0;
    const absentCount =
      countByResult.find((r) => r.result === 'ABSENT')?._count._all ?? 0;
    const totalCount = arrivedCount + lateCount + absentCount;

    // 출석률 계산 (소수점 2자리 문자열)
    const attendanceRate =
      totalCount > 0 ? ((arrivedCount / totalCount) * 100).toFixed(2) : '0.00';

    return {
      userId,
      arrivedCount,
      lateCount,
      absentCount,
      totalCount,
      attendanceRate,
    };
  }
}
