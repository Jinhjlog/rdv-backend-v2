import { CoreModule } from '@core/core.module';
import { Type } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { UserGroupModule } from './group/user-group.module';
import { UserCharacterModule } from './character/user-character.module';
import { UserEventModule } from './event/user-event.module';
import { UserLocationTrackingModule } from './location-tracking/user-location-tracking.module';
import { DeviceTokenModule } from './device-token/device-token.module';
import { AppVersionModule } from './app-version/app-version.module';
import { NotificationModule } from './notification/notification.module';

export const modules: Type<any>[] = [
  CoreModule,
  AppVersionModule,
  AuthModule,
  HealthModule,
  UserModule,
  UserCharacterModule,
  UserGroupModule,
  UserEventModule,
  UserLocationTrackingModule,
  DeviceTokenModule,
  NotificationModule,
];
