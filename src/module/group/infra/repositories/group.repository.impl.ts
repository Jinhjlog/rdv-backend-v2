import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import { Group } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { GroupMapper, GroupMemberMapper } from '../mappers';
import { TransactionContextService } from '@lib/infra/unit-of-work';
import { PrismaTransactionClient } from '@core/database';
import { DomainEvents } from '@lib/domain/events/domain-events';

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

  async save(group: Group): Promise<void> {
    if (this.txContext.isInTransaction()) {
      await this._saveWithClient(this.client, group);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await this._saveWithClient(tx, group);
    });

    if (group.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(group.id);
    }
  }

  private async _saveWithClient(
    client: PrismaService | PrismaTransactionClient,
    group: Group,
  ): Promise<void> {
    // 1. Group (Aggregate Root) 저장
    const groupData = GroupMapper.toPersistence(group);

    await client.groups.upsert({
      where: { id: group.id.toString() },
      update: groupData,
      create: groupData,
    });

    // 2. 명시적으로 삭제 요청된 멤버만 삭제
    const removedMemberIds = group.removedMemberIds;
    if (removedMemberIds.length > 0) {
      await client.group_members.deleteMany({
        where: { id: { in: [...removedMemberIds] } },
      });
      group.clearRemovedMemberIds();
    }

    // 3. 멤버 저장/업데이트 (배치 처리)
    if (group.members.length > 0) {
      await Promise.all(
        group.members.map(async (member) => {
          const memberData = GroupMemberMapper.toPersistence(member);
          await client.group_members.upsert({
            where: { id: member.id.toString() },
            update: memberData,
            create: memberData,
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

  async delete(id: string): Promise<void> {
    await this.client.groups.delete({
      where: { id },
    });
  }
}
