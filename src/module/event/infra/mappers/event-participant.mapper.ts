import {
  event_participants as EventParticipantPrisma,
  Prisma,
} from '@prisma/generated/client';
import { EventParticipant, ParticipantStatus } from '../../domain/models';

/**
 * EventParticipantMapper
 *
 * EventParticipant 엔티티와 Prisma 모델 간의 매핑
 */
export class EventParticipantMapper {
  /**
   * Prisma 모델을 도메인 엔티티로 변환합니다
   *
   * @param {EventParticipantPrisma} prismaMember Prisma 모델
   * @returns {EventParticipant} 도메인 엔티티
   */
  static toDomain(prismaMember: EventParticipantPrisma): EventParticipant {
    return EventParticipant.unsafeCreate({
      id: prismaMember.id,
      eventId: prismaMember.event_id,
      userId: prismaMember.user_id,
      status: ParticipantStatus[prismaMember.status],
      joinedAt: prismaMember.joined_at,
      departedAt:
        prismaMember.departed_at !== null
          ? prismaMember.departed_at
          : undefined,
      arrivedAt:
        prismaMember.arrived_at !== null ? prismaMember.arrived_at : undefined,
    });
  }

  /**
   * 도메인 엔티티를 Prisma 모델로 변환합니다
   *
   * @param {EventParticipant} member 도메인 엔티티
   * @returns {Prisma.event_participantsCreateInput} Prisma 모델
   */
  static toPersistence(
    member: EventParticipant,
  ): Prisma.event_participantsCreateInput {
    return {
      id: member.id.toString(),
      status: member.status,
      joined_at: member.joinedAt,
      departed_at: member.departedAt !== undefined ? member.departedAt : null,
      arrived_at: member.arrivedAt !== undefined ? member.arrivedAt : null,
      events: { connect: { id: member.eventId } },
      users: { connect: { id: member.userId } },
    };
  }
}
