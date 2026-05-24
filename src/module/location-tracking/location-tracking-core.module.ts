import { Module } from '@nestjs/common';
import { LocationTrackingRepository } from './domain/repositories';
import {
  LocationTrackingQueryService,
  EventLookupService,
  UserLookupService,
} from './domain/services';
import { LocationTrackingRepositoryImpl } from './infra/repositories';
import {
  LocationTrackingQueryServiceImpl,
  EventLookupServiceImpl,
  UserLookupServiceImpl,
} from './infra/services';

@Module({
  providers: [
    {
      provide: LocationTrackingRepository,
      useClass: LocationTrackingRepositoryImpl,
    },
    {
      provide: LocationTrackingQueryService,
      useClass: LocationTrackingQueryServiceImpl,
    },
    {
      provide: EventLookupService,
      useClass: EventLookupServiceImpl,
    },
    {
      provide: UserLookupService,
      useClass: UserLookupServiceImpl,
    },
  ],
  exports: [
    LocationTrackingRepository,
    LocationTrackingQueryService,
    EventLookupService,
    UserLookupService,
  ],
})
export class LocationTrackingCoreModule {}
