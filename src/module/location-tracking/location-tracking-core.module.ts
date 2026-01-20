import { Module } from '@nestjs/common';
import {
  EventRepository,
  LocationTrackingQueryRepository,
  LocationTrackingRepository,
  UserRepository,
} from './domain/repositories';
import {
  EventRepositoryImpl,
  LocationTrackingQueryRepositoryImpl,
  LocationTrackingRepositoryImpl,
  UserRepositoryImpl,
} from './infra/repositories';

@Module({
  providers: [
    {
      provide: LocationTrackingRepository,
      useClass: LocationTrackingRepositoryImpl,
    },
    {
      provide: LocationTrackingQueryRepository,
      useClass: LocationTrackingQueryRepositoryImpl,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: EventRepository,
      useClass: EventRepositoryImpl,
    },
  ],
  exports: [
    LocationTrackingRepository,
    LocationTrackingQueryRepository,
    UserRepository,
    EventRepository,
  ],
})
export class LocationTrackingCoreModule {}
