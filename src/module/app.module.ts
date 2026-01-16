import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { modules } from './index';
import { LoggerMiddleware } from '@core/logger';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/exception';

@Module({
  imports: [...modules],
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
