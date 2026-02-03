import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { modules } from './index';
import { LoggerMiddleware } from '@core/logger';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/exception';

@Module({
  imports: [
    ...modules,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1분
        limit: 30, // 30회
      },
    ]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
