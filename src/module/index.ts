import { CoreModule } from '@core/core.module';
import { Type } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';

export const modules: Type<any>[] = [
  CoreModule,
  AuthModule,
  HealthModule,
  UserModule,
];
