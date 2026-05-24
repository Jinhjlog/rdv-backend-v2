import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import {
  LocationTrackingQueryService,
  FindLocationsByEventParams,
} from '../../domain/services';
import { LocationTrackingReadModel } from '../../domain/models';

@Injectable()
export class LocationTrackingQueryServiceImpl implements LocationTrackingQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEventId(
    params: FindLocationsByEventParams,
  ): Promise<LocationTrackingReadModel[]> {
    const { eventId } = params;

    const locations = await this.prisma.location_trackings.findMany({
      where: { event_id: eventId },
      orderBy: { updated_at: 'desc' },
    });

    return locations.map((location) => ({
      userId: location.user_id,
      nickname: location.nickname,
      nameTag: location.name_tag,
      characterCode: location.character_code,
      latitude:
        location.latitude !== null ? location.latitude.toString() : undefined,
      longitude:
        location.longitude !== null ? location.longitude.toString() : undefined,
      lastUpdatedAt:
        location.updated_at !== null ? location.updated_at : undefined,
    }));
  }
}
