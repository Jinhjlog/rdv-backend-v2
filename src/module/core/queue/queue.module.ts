import { EnvironmentConfig } from '@core/config/environment.config';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bullmq';
import { QueueService } from './queue.service';
import { BullQueueService } from './bull-queue.service';
import { CloudTasksQueueService } from './cloud-tasks-queue.service';

/**
 * QUEUE_DRIVER 환경변수로 큐 구현체를 선택한다.
 *
 * - `bullmq` (기본): Redis 기반 BullMQ 사용 (기존 동작)
 * - `cloud-tasks`: Google Cloud Tasks 사용 (Cloud Run min-instances=0 가능)
 *
 * 모듈 로드 시점에 한 번만 평가되므로 런타임 변경은 불가. 드라이버를 바꾸려면
 * 환경변수 변경 후 재배포가 필요하다. Migration 기간 동안 양쪽 공존을 위해 추가됨.
 */
const queueDriver =
  process.env.QUEUE_DRIVER === 'cloud-tasks' ? 'cloud-tasks' : 'bullmq';

const bullImports =
  queueDriver === 'bullmq'
    ? [
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
                db: redisConfig.queueDB,
              },
            };
          },
        }),
      ]
    : [];

@Module({
  imports: bullImports,
  providers: [
    {
      provide: QueueService,
      useClass:
        queueDriver === 'cloud-tasks'
          ? CloudTasksQueueService
          : BullQueueService,
    },
  ],
  exports: [QueueService],
})
export class QueueModule {}
