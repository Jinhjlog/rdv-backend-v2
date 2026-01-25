import { Injectable } from '@nestjs/common';
import {
  EventQueryRepository,
  FindEventListParams,
  FindEventDetailParams,
  FindActiveEventParams,
  FindCalendarMarkedDatesParams,
  FindCalendarEventListParams,
  FindEventResultParams,
} from '../../domain/repositories';
import { PrismaService } from '@core/database';
import {
  EventListItemQueryModel,
  EventDetailQueryModel,
  ActiveEventQueryModel,
  CalendarEventListItemQueryModel,
  EventResultQueryModel,
} from '../../domain/models';
import { event_status, Prisma } from '@prisma/client';

@Injectable()
export class EventQueryRepositoryImpl implements EventQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findList(
    params: FindEventListParams,
  ): Promise<EventListItemQueryModel[]> {
    const { contextUserId, groupId, status } = params;

    const whereClause: Prisma.eventsWhereInput = {};

    if (contextUserId) {
      whereClause.groups = {
        group_members: {
          some: { user_id: contextUserId },
        },
      };
    }

    if (groupId) {
      whereClause.group_id = groupId;
    }

    if (status) {
      whereClause.status = status as event_status;
    }

    const events = await this.prisma.events.findMany({
      where: whereClause,
      include: {
        event_participants: {
          select: {
            user_id: true,
          },
        },
        groups: {
          select: {
            max_members: true,
          },
        },
        users: {
          select: {
            nickname: true,
            level: true,
            character_code: true,
          },
        },
      },
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      eventTime: event.event_time,
      locationAddress: event.location_address,
      locationDetail: event.location_detail,
      status: event.status,
      participants: event.event_participants.map((participant) => ({
        userId: participant.user_id,
      })),
      maxParticipants: event.groups.max_members,
      createdBy: {
        nickname: event.users.nickname,
        level: event.users.level,
        characterCode: event.users.character_code,
      },
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  }

  async findDetail(
    params: FindEventDetailParams,
  ): Promise<EventDetailQueryModel | undefined> {
    const { eventId, contextUserId } = params;

    const whereClause: Prisma.eventsWhereUniqueInput = {
      id: eventId,
    };

    if (contextUserId) {
      whereClause.groups = {
        group_members: {
          some: { user_id: contextUserId },
        },
      };
    }

    const event = await this.prisma.events.findUnique({
      where: whereClause,
      include: {
        users: {
          select: {
            id: true,
            nickname: true,
            name_tag: true,
            character_code: true,
            preferred_theme_color: true,
            level: true,
          },
        },
        groups: {
          select: {
            max_members: true,
          },
        },
        event_participants: {
          select: {
            status: true,
            users: {
              select: {
                id: true,
                nickname: true,
                name_tag: true,
                character_code: true,
                preferred_theme_color: true,
              },
            },
          },
        },
      },
    });
    if (!event) {
      return undefined;
    }

    return {
      id: event.id,
      groupId: event.group_id,
      createdBy: {
        userId: event.users.id,
        nickname: event.users.nickname,
        nameTag: event.users.name_tag,
        characterCode: event.users.character_code,
        preferredThemeColor: event.users.preferred_theme_color,
        level: event.users.level,
      },
      title: event.title,
      description: event.description,
      eventTime: event.event_time,
      trackingStartTime: event.tracking_start_time,
      endTime: event.end_time,
      locationAddress: event.location_address,
      locationDetail: event.location_detail,
      locationLatitude: event.location_latitude.toString(),
      locationLongitude: event.location_longitude.toString(),
      status: event.status,
      maxParticipants: event.groups.max_members,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      participants: event.event_participants.map((participant) => ({
        userId: participant.users.id,
        nickname: participant.users.nickname,
        nameTag: participant.users.name_tag,
        characterCode: participant.users.character_code,
        preferredThemeColor: participant.users.preferred_theme_color,
        status: participant.status,
      })),
    };
  }

  async findActiveEventByGroupId(
    params: FindActiveEventParams,
  ): Promise<ActiveEventQueryModel | undefined> {
    const { groupId, contextUserId } = params;

    const whereClause: Prisma.eventsWhereInput = {
      group_id: groupId,
      status: event_status.IN_PROGRESS,
    };

    if (contextUserId) {
      whereClause.groups = {
        group_members: {
          some: { user_id: contextUserId },
        },
      };
    }

    const event = await this.prisma.events.findFirst({
      where: whereClause,
      select: {
        id: true,
        group_id: true,
        event_time: true,
        tracking_start_time: true,
        end_time: true,
      },
    });

    if (!event) {
      return undefined;
    }

    return {
      id: event.id,
      groupId: event.group_id,
      eventTime: event.event_time,
      trackingStartTime: event.tracking_start_time,
      endTime: event.end_time,
    };
  }

  async findCalendarMarkedDates(
    params: FindCalendarMarkedDatesParams,
  ): Promise<string[]> {
    const { userId, year, month } = params;

    // KST(+09:00) 기준으로 해당 월의 시작일과 종료일 계산
    const monthStr = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate(); // 해당 월의 마지막 날
    const startDate = new Date(`${year}-${monthStr}-01T00:00:00+09:00`);
    const endDate = new Date(
      `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+09:00`,
    );

    const events = await this.prisma.events.findMany({
      where: {
        event_time: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [event_status.RECRUITING, event_status.IN_PROGRESS],
        },
        // 사용자가 소속된 그룹의 일정
        groups: {
          group_members: {
            some: { user_id: userId },
          },
        },
      },
      select: {
        event_time: true,
      },
    });

    // KST 기준으로 날짜 추출하여 중복 제거
    const dateSet = new Set<string>();
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    events.forEach((event) => {
      // UTC 시간에 9시간 더해서 KST로 변환 후 날짜 추출
      const kstTime = new Date(event.event_time.getTime() + KST_OFFSET_MS);
      const dateStr = kstTime.toISOString().split('T')[0];
      dateSet.add(dateStr);
    });

    return Array.from(dateSet).sort();
  }

  async findCalendarEventList(
    params: FindCalendarEventListParams,
  ): Promise<CalendarEventListItemQueryModel[]> {
    const { userId, date } = params;

    // KST(+09:00) 기준으로 해당 날짜의 시작과 끝 계산
    // 예: 2026-01-23 입력 시
    // startDate: KST 2026-01-23 00:00:00 = UTC 2026-01-22 15:00:00
    // endDate: KST 2026-01-23 23:59:59 = UTC 2026-01-23 14:59:59
    const startDate = new Date(`${date}T00:00:00+09:00`);
    const endDate = new Date(`${date}T23:59:59.999+09:00`);

    const events = await this.prisma.events.findMany({
      where: {
        event_time: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [event_status.RECRUITING, event_status.IN_PROGRESS],
        },
        // 사용자가 소속된 그룹의 일정
        groups: {
          group_members: {
            some: { user_id: userId },
          },
        },
      },
      include: {
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
        event_participants: {
          select: {
            user_id: true,
          },
        },
      },
      orderBy: {
        event_time: 'asc',
      },
    });

    return events.map((event) => ({
      id: event.id,
      groupId: event.groups.id,
      groupName: event.groups.name,
      title: event.title,
      eventTime: event.event_time,
      locationAddress: event.location_address,
      locationDetail: event.location_detail,
      status: event.status,
      isParticipant: event.event_participants.some(
        (participant) => participant.user_id === userId,
      ),
    }));
  }

  async findEventResult(
    params: FindEventResultParams,
  ): Promise<EventResultQueryModel | undefined> {
    const { eventId, contextUserId } = params;

    const whereClause: Prisma.eventsWhereUniqueInput = {
      id: eventId,
      status: event_status.ENDED,
    };

    if (contextUserId) {
      whereClause.groups = {
        group_members: {
          some: { user_id: contextUserId },
        },
      };
    }

    const event = await this.prisma.events.findUnique({
      where: whereClause,
      select: {
        id: true,
        group_id: true,
        title: true,
        event_time: true,
        location_address: true,
        location_detail: true,
        event_results: {
          select: {
            result: true,
            users: {
              select: {
                id: true,
                nickname: true,
                name_tag: true,
                character_code: true,
                preferred_theme_color: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return undefined;
    }

    return {
      eventId: event.id,
      groupId: event.group_id,
      title: event.title,
      eventTime: event.event_time,
      locationAddress: event.location_address,
      locationDetail: event.location_detail,
      results: event.event_results.map((result) => ({
        userId: result.users.id,
        nickname: result.users.nickname,
        nameTag: result.users.name_tag,
        characterCode: result.users.character_code,
        preferredThemeColor: result.users.preferred_theme_color,
        result: result.result,
      })),
    };
  }
}
