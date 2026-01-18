import { Module } from '@nestjs/common';
import {
  EventRepository,
  LocationTrackingRepository,
  UserRepository,
} from './domain/repositories';
import {
  EventRepositoryImpl,
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
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: EventRepository,
      useClass: EventRepositoryImpl,
    },
  ],
  exports: [LocationTrackingRepository],
})
export class LocationTrackingCoreModule {}
