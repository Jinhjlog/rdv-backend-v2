import {
  event_results as EventResultPrisma,
  Prisma,
} from '@prisma/client';
import { AttendanceResult, EventResult } from '../../domain/models';

/**
 * EventResultMapper
 *
 * EventResult 엔티티와 Prisma 모델 간의 매핑
 */
export class EventResultMapper {
  /**
   * Prisma 모델을 도메인 엔티티로 변환합니다
   *
   * @param {EventResultPrisma} prismaResult Prisma 모델
   * @returns {EventResult} 도메인 엔티티
   */
  static toDomain(prismaResult: EventResultPrisma): EventResult {
    return EventResult.unsafeCreate({
      id: prismaResult.id,
      eventId: prismaResult.event_id,
      userId: prismaResult.user_id,
      result: AttendanceResult[prismaResult.result],
      createdAt: prismaResult.created_at,
    });
  }

  /**
   * 도메인 엔티티를 Prisma 모델로 변환합니다
   *
   * @param {EventResult} result 도메인 엔티티
   * @returns {Prisma.event_resultsCreateInput} Prisma 모델
   */
  static toPersistence(result: EventResult): Prisma.event_resultsCreateInput {
    return {
      id: result.id.toString(),
      result: result.result,
      created_at: result.createdAt,
      events: { connect: { id: result.eventId } },
      users: { connect: { id: result.userId } },
    };
  }
}
