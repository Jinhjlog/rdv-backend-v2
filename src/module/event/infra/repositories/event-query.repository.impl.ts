import { Injectable } from '@nestjs/common';
import {
  EventQueryRepository,
  FindEventListParams,
} from '../../domain/repositories';
import { PrismaService } from '@core/database';
import { EventListItemQueryModel } from '../../domain/models';
import { event_status, Prisma } from '@prisma/generated/client';

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
}
