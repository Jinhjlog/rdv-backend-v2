import { Injectable } from '@nestjs/common';
import {
  EventQueryRepository,
  FindEventListParams,
  FindEventDetailParams,
} from '../../domain/repositories';
import { PrismaService } from '@core/database';
import {
  EventListItemQueryModel,
  EventDetailQueryModel,
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
}
