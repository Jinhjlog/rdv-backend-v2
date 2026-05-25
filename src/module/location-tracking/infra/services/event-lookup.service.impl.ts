import { Injectable } from '@nestjs/common';
import { EventLookupService } from '../../domain/services';
import { PrismaService } from '@core/database';
import { event_status } from '@prisma/client';

@Injectable()
export class EventLookupServiceImpl implements EventLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async existsByStatusInProgress(eventId: string): Promise<boolean> {
    const count = await this.prisma.events.count({
      where: {
        id: eventId,
        status: event_status.IN_PROGRESS,
      },
    });

    return count > 0;
  }

  async isGroupMemberOfEvent(
    eventId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.prisma.group_members.count({
      where: {
        user_id: userId,
        groups: {
          events: {
            some: { id: eventId },
          },
        },
      },
    });

    return count > 0;
  }

  async findEventTimeById(eventId: string): Promise<Date | undefined> {
    const event = await this.prisma.events.findUnique({
      where: { id: eventId },
      select: { event_time: true },
    });

    return event?.event_time ?? undefined;
  }
}
