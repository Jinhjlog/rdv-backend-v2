import { CoreModule } from '@core/core.module';
import { Type } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { UserGroupModule } from './group/user-group.module';
import { UserCharacterModule } from './character/user-character.module';
import { UserEventModule } from './event/user-event.module';
import { UserLocationTrackingModule } from './location-tracking/user-location-tracking.module';

export const modules: Type<any>[] = [
  CoreModule,
  AuthModule,
  HealthModule,
  UserModule,
  UserCharacterModule,
  UserGroupModule,
  UserEventModule,
  UserLocationTrackingModule,
];
