import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { PrismaService } from '@core/database';
import { event_status } from '@prisma/generated/enums';

@Injectable()
export class EventRepositoryImpl implements EventRepository {
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
