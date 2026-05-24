import {
  Prisma,
  location_trackings as LocationTrackingPrisma,
} from '@prisma/client';
import { Coordinate } from '@lib/domain';
import { LocationTracking } from '../../domain/models';

export class LocationTrackingMapper {
  static toDomain(
    prismaLocationTracking: LocationTrackingPrisma,
  ): LocationTracking {
    let coordinate: Coordinate | undefined;
    if (
      prismaLocationTracking.latitude !== null &&
      prismaLocationTracking.longitude !== null &&
      prismaLocationTracking.updated_at !== null
    ) {
      coordinate = Coordinate.unsafeCreate({
        latitude: prismaLocationTracking.latitude.toString(),
        longitude: prismaLocationTracking.longitude.toString(),
        updatedAt: prismaLocationTracking.updated_at,
      });
    }
    return LocationTracking.unsafeCreate({
      id: prismaLocationTracking.id,
      eventId: prismaLocationTracking.event_id,
      userId: prismaLocationTracking.user_id,
      nickname: prismaLocationTracking.nickname,
      nameTag: prismaLocationTracking.name_tag,
      characterCode: prismaLocationTracking.character_code,
      coordinate,
    });
  }

  static toPersistence(
    domainLocationTracking: LocationTracking,
  ): Prisma.location_trackingsUncheckedCreateInput {
    let latitude: Prisma.Decimal | null = null;
    let longitude: Prisma.Decimal | null = null;
    let updatedAt: Date | null = null;

    if (domainLocationTracking.coordinate) {
      latitude = new Prisma.Decimal(domainLocationTracking.coordinate.latitude);
      longitude = new Prisma.Decimal(
        domainLocationTracking.coordinate.longitude,
      );
      updatedAt = domainLocationTracking.coordinate.updatedAt;
    }

    return {
      id: domainLocationTracking.id.toString(),
      event_id: domainLocationTracking.eventId,
      user_id: domainLocationTracking.userId,
      nickname: domainLocationTracking.nickname,
      name_tag: domainLocationTracking.nameTag,
      character_code: domainLocationTracking.characterCode,
      latitude,
      longitude,
      updated_at: updatedAt,
    };
  }
}
