import { Injectable } from '@nestjs/common';
import {
  FindGroupDetailParams,
  FindGroupListParams,
  GroupQueryRepository,
} from '../../domain/repositories';
import {
  GroupDetailQueryModel,
  GroupListItemQueryModel,
} from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupQueryRepositoryImpl implements GroupQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findList(
    params: FindGroupListParams,
  ): Promise<GroupListItemQueryModel[]> {
    const { contextUserId } = params;
    const whereClause: Prisma.groupsWhereInput = {};

    if (!contextUserId) {
      whereClause.group_members = {
        some: { user_id: contextUserId },
      };
    }

    const groups = await this.prisma.groups.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        icon_code: true,
        owner_id: true,
        max_members: true,
        is_public: true,
        created_at: true,
        updated_at: true,
      },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      iconCode: group.icon_code,
      ownerId: group.owner_id,
      maxMembers: group.max_members,
      isPublic: group.is_public,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    }));
  }

  async findDetail(
    params: FindGroupDetailParams,
  ): Promise<GroupDetailQueryModel | undefined> {
    const { groupId } = params;

    const group = await this.prisma.groups.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon_code: true,
        owner_id: true,
        max_members: true,
        is_public: true,
        created_at: true,
        updated_at: true,
        group_members: true,
      },
    });
    if (!group) {
      return undefined;
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      iconCode: group.icon_code,
      ownerId: group.owner_id,
      maxMembers: group.max_members,
      isPublic: group.is_public,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
      members: group.group_members.map((member) => ({
        id: member.id,
        groupId: member.group_id,
        userId: member.user_id,
        role: member.role,
        invitedBy: member.invited_by || undefined,
        joinedAt: member.joined_at,
      })),
    };
  }
}
