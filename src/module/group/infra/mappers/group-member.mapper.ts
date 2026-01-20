import {
  group_members as GroupMemberPrisma,
  Prisma,
} from '@prisma/client';
import { GroupMember, GroupMemberRole } from '../../domain';

/**
 * GroupMemberMapper
 *
 * GroupMember 엔티티와 Prisma 모델 간의 매핑
 */
export class GroupMemberMapper {
  /**
   * Prisma 모델을 도메인 엔티티로 변환합니다
   *
   * @param {GroupMemberPrisma} prismaMember Prisma 모델
   * @returns {GroupMember} 도메인 엔티티
   */
  static toDomain(prismaMember: GroupMemberPrisma): GroupMember {
    return GroupMember.unsafeCreate({
      id: prismaMember.id,
      groupId: prismaMember.group_id,
      userId: prismaMember.user_id,
      role: GroupMemberRole[prismaMember.role],
      invitedBy: prismaMember.invited_by ?? undefined,
      joinedAt: prismaMember.joined_at,
    });
  }

  /**
   * 도메인 엔티티를 Prisma 모델로 변환합니다
   *
   * @param {GroupMember} member 도메인 엔티티
   * @returns {Prisma.group_membersCreateInput} Prisma 모델
   */
  static toPersistence(member: GroupMember): Prisma.group_membersCreateInput {
    return {
      id: member.id.toString(),
      role: member.role,
      joined_at: member.joinedAt,
      groups: { connect: { id: member.groupId } },
      users_group_members_user_idTousers: {
        connect: { id: member.userId },
      },
      users_group_members_invited_byTousers:
        member.invitedBy !== undefined
          ? {
              connect: { id: member.invitedBy },
            }
          : undefined,
    };
  }
}
