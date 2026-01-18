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

/**
 * LocationTracking Core Module
 *
 * LocationTracking 도메인의 핵심 기능을 제공하는 모듈
 * - 위치 추적 정보 저장 (UPSERT)
 * - 최초 스냅샷 생성
 */
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
