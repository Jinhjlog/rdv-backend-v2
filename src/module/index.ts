import { CoreModule } from '@core/core.module';
import { Type } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { UserGroupModule } from './group/user-group.module';
import { UserCharacterModule } from './character/user-character.module';

export const modules: Type<any>[] = [
  CoreModule,
  AuthModule,
  HealthModule,
  UserModule,
  UserGroupModule,
  UserCharacterModule,
];
