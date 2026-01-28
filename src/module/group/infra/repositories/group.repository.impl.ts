import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import { Group } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { GroupMapper, GroupMemberMapper } from '../mappers';
import { TransactionContextService } from '@lib/infra/unit-of-work';
import { PrismaTransactionClient } from '@core/database';

@Injectable()
export class GroupRepositoryImpl implements GroupRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: TransactionContextService<PrismaTransactionClient>,
  ) {}

  private get client(): PrismaService | PrismaTransactionClient {
    const tx = this.txContext.getTransactionContext();
    return tx ?? this.prisma;
  }

  /**
   * Group Aggregate Root를 저장합니다
   *
   * 트랜잭션 관리:
   * - UnitOfWork 컨텍스트 내부: 외부 트랜잭션 재사용 (txContext를 통해 자동 주입)
   * - UnitOfWork 없이 호출: 내부에서 새 트랜잭션 생성
   *
   * 저장 작업:
   * 1. Group (Aggregate Root) 저장/업데이트
   * 2. 제거된 멤버 삭제 (Orphan 제거)
   * 3. 멤버 저장/업데이트 (배치 처리)
   *
   * @param {Group} group 저장할 Group Aggregate Root
   */
  async save(group: Group): Promise<void> {
    // 이미 트랜잭션 컨텍스트 내부라면 현재 트랜잭션 재사용
    if (this.txContext.isInTransaction()) {
      await this._saveWithClient(this.client, group);
      return;
    }

    // 트랜잭션이 없으면 새로 시작 (Aggregate 일관성 보장)
    await this.prisma.$transaction(async (tx) => {
      await this._saveWithClient(tx, group);
    });
  }

  /**
   * 실제 저장 로직 (트랜잭션 클라이언트 사용)
   */
  private async _saveWithClient(
    client: PrismaService | PrismaTransactionClient,
    group: Group,
  ): Promise<void> {
    // 1. Group (Aggregate Root) 저장
    const groupData = GroupMapper.toPersistence(group);

    await client.groups.upsert({
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

    // 2. 명시적으로 삭제 요청된 멤버만 삭제
    const removedMemberIds = group.removedMemberIds;
    if (removedMemberIds.length > 0) {
      await client.group_members.deleteMany({
        where: {
          id: { in: removedMemberIds },
        },
      });
      group.clearRemovedMemberIds();
    }

    // 3. 멤버 저장/업데이트 (배치 처리)
    if (group.members.length > 0) {
      await Promise.all(
        group.members.map(async (member) => {
          await client.group_members.upsert({
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
  }

  async findById(id: string): Promise<Group | undefined> {
    const prismaGroup = await this.client.groups.findUnique({
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
    const count = await this.client.groups.count({
      where: { owner_id: ownerId },
    });

    return count > 0;
  }

  /**
   * Group을 삭제합니다.
   * 연결된 GroupMembers도 함께 삭제됩니다 (Cascade Delete).
   *
   * @param {string} id 삭제할 Group ID
   */
  async delete(id: string): Promise<void> {
    await this.client.groups.delete({
      where: { id },
    });
  }
}
