import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import { PrismaService } from '@core/database';

@Injectable()
export class GroupRepositoryImpl implements GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(groupId: string): Promise<boolean> {
    const count = await this.prisma.groups.count({
      where: { id: groupId },
    });

    return count > 0;
  }

  async findMemberUserIds(groupId: string): Promise<string[]> {
    const members = await this.prisma.group_members.findMany({
      where: { group_id: groupId },
      select: { user_id: true },
    });

    return members.map((m) => m.user_id);
  }
}
