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
}
