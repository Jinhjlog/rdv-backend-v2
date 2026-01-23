import { Injectable } from '@nestjs/common';
import {
  FindGroupDetailParams,
  FindGroupListParams,
  FindMemberAttendanceStatisticsParams,
  GroupQueryRepository,
} from '../../domain/repositories';
import {
  GroupDetailQueryModel,
  GroupListItemQueryModel,
  GroupMemberAttendanceStatisticsQueryModel,
  MemberAttendanceStatisticsQueryModel,
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

    if (contextUserId) {
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
        _count: {
          select: {
            group_members: true,
          },
        },
        events: {
          where: {
            status: 'ENDED',
          },
          orderBy: {
            event_time: 'desc',
          },
          take: 1,
          select: {
            event_time: true,
            location_detail: true,
          },
        },
      },
    });

    return groups.map((group) => {
      const lastEndedEvent = group.events[0];

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
        memberCount: group._count.group_members,
        lastEndedEvent: lastEndedEvent
          ? {
              eventTime: lastEndedEvent.event_time,
              locationDetail: lastEndedEvent.location_detail,
            }
          : undefined,
      };
    });
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
        group_members: {
          select: {
            id: true,
            group_id: true,
            user_id: true,
            role: true,
            joined_at: true,
            users_group_members_user_idTousers: {
              select: {
                nickname: true,
                name_tag: true,
                preferred_theme_color: true,
                character_code: true,
              },
            },
          },
        },
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
        nickname: member.users_group_members_user_idTousers.nickname,
        nameTag: member.users_group_members_user_idTousers.name_tag,
        preferredThemeColor:
          member.users_group_members_user_idTousers.preferred_theme_color,
        characterCode: member.users_group_members_user_idTousers.character_code,
        role: member.role,
        joinedAt: member.joined_at,
      })),
    };
  }

  async findMemberAttendanceStatistics(
    params: FindMemberAttendanceStatisticsParams,
  ): Promise<GroupMemberAttendanceStatisticsQueryModel> {
    const { groupId } = params;

    // 단일 Raw SQL 쿼리로 멤버 정보 + 출석 통계 조회
    const rawResults = await this.prisma.$queryRaw<
      {
        user_id: string;
        nickname: string;
        arrived_count: bigint;
        late_count: bigint;
        absent_count: bigint;
      }[]
    >`
      SELECT
        gm.user_id,
        u.nickname,
        COALESCE(SUM(CASE WHEN er.result = 'ARRIVED' THEN 1 ELSE 0 END), 0) as arrived_count,
        COALESCE(SUM(CASE WHEN er.result = 'LATE' THEN 1 ELSE 0 END), 0) as late_count,
        COALESCE(SUM(CASE WHEN er.result = 'ABSENT' THEN 1 ELSE 0 END), 0) as absent_count
      FROM public.group_members gm
      INNER JOIN public.users u ON gm.user_id = u.id
      LEFT JOIN public.events e ON e.group_id = gm.group_id
      LEFT JOIN public.event_results er ON er.event_id = e.id AND er.user_id = gm.user_id
      WHERE gm.group_id = ${groupId}::uuid
      GROUP BY gm.user_id, u.nickname
    `;

    const members: MemberAttendanceStatisticsQueryModel[] = rawResults.map(
      (row) => {
        const arrivedCount = Number(row.arrived_count);
        const lateCount = Number(row.late_count);
        const absentCount = Number(row.absent_count);
        const totalCount = arrivedCount + lateCount + absentCount;

        return {
          userId: row.user_id,
          nickname: row.nickname,
          arrivedCount,
          lateCount,
          absentCount,
          totalCount,
          attendanceRate:
            totalCount > 0
              ? ((arrivedCount / totalCount) * 100).toFixed(2)
              : '0.00',
        };
      },
    );

    return { groupId, members };
  }
}
