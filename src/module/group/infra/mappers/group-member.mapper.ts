import { group_members as GroupMemberPrisma, Prisma } from '@prisma/client';
import { GroupMember, GroupMemberRole } from '../../domain';

export class GroupMemberMapper {
  static toDomain(prismaMember: GroupMemberPrisma): GroupMember {
    return GroupMember.unsafeCreate({
      id: prismaMember.id,
      groupId: prismaMember.group_id,
      userId: prismaMember.user_id,
      role: GroupMemberRole[prismaMember.role],
      invitedBy:
        prismaMember.invited_by !== null ? prismaMember.invited_by : undefined,
      joinedAt: prismaMember.joined_at,
    });
  }

  static toPersistence(
    member: GroupMember,
  ): Prisma.group_membersUncheckedCreateInput {
    return {
      id: member.id.toString(),
      group_id: member.groupId,
      user_id: member.userId,
      role: member.role,
      invited_by: member.invitedBy !== undefined ? member.invitedBy : null,
      joined_at: member.joinedAt,
    };
  }
}
