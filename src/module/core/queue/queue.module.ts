import { EnvironmentConfig } from '@core/config/environment.config';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';
import { QueueService } from './queue.service';
import { BullQueueService } from './bull-queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentConfig>,
      ): QueueOptions => {
        const redisConfig =
          configService.get<EnvironmentConfig['redis']>('redis');

        if (!redisConfig) {
          throw new Error('Redis 설정이 누락되었습니다.');
        }

        return {
          connection: {
            url: redisConfig.url,
            password: redisConfig.password,
            db: redisConfig.queueDB,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: QueueService,
      useClass: BullQueueService,
    },
  ],
  exports: [QueueService],
})
export class QueueModule {}
