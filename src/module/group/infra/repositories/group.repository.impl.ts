import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import { Group } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { GroupMapper, GroupMemberMapper } from '../mappers';

@Injectable()
export class GroupRepositoryImpl implements GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Group Aggregate Root를 저장합니다
   *
   * 트랜잭션 내에서:
   * 1. Group (Aggregate Root) 저장/업데이트
   * 2. 제거된 멤버 삭제 (Orphan 제거)
   * 3. 멤버 저장/업데이트 (배치 처리)
   *
   * @param {Group} group 저장할 Group Aggregate Root
   * @throws {Error} 트랜잭션 실패 시
   */
  async save(group: Group): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Group (Aggregate Root) 저장
      const groupData = GroupMapper.toPersistence(group);

      await tx.groups.upsert({
        where: { id: group.id.toString() },
        update: groupData,
        create: {
          id: group.id.toString(),
          name: group.name.value,
          description: group.description.value,
          icon_code: group.iconCode,
          owner_id: group.ownerId,
          max_members: group.maxMembers,
          is_public: group.isPublic,
          created_at: group.createdAt,
          updated_at: group.updatedAt,
        },
      });

      // 2. 제거된 멤버 삭제 (Orphan 제거)
      const currentMemberIds = group.members.map((member) =>
        member.id.toString(),
      );

      await tx.group_members.deleteMany({
        where: {
          group_id: group.id.toString(),
          NOT: { id: { in: currentMemberIds } },
        },
      });

      // 3. 멤버 저장/업데이트 (배치 처리)
      if (group.members.length > 0) {
        await Promise.all(
          group.members.map(async (member) => {
            await tx.group_members.upsert({
              where: { id: member.id.toString() },
              update: {
                role: member.role,
                invited_by: member.invitedBy,
                joined_at: member.joinedAt,
              },
              create: {
                id: member.id.toString(),
                group_id: group.id.toString(),
                user_id: member.userId,
                role: member.role,
                invited_by: member.invitedBy,
                joined_at: member.joinedAt,
              },
            });
          }),
        );
      }
    });
  }

  async findById(id: string): Promise<Group | undefined> {
    const prismaGroup = await this.prisma.groups.findUnique({
      where: { id },
      include: {
        group_members: true,
      },
    });
    if (!prismaGroup) {
      return undefined;
    }

    const members = prismaGroup.group_members.map((prismaMember) =>
      GroupMemberMapper.toDomain(prismaMember),
    );
    return GroupMapper.toDomain(prismaGroup, members);
  }

  async existsByOwnerId(ownerId: string): Promise<boolean> {
    const count = await this.prisma.groups.count({
      where: { owner_id: ownerId },
    });

    return count > 0;
  }
}
