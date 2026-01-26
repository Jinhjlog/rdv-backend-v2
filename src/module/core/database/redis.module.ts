import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { RedisOptions } from 'ioredis';
import { EnvironmentConfig } from '@core/config/environment.config';

export const AUTH_REDIS_CONNECTION = 'auth';
export const MEETING_ROOM_REDIS_CONNECTION = 'meetingRoom';

interface RedisInstanceConfig {
  dbKey: keyof EnvironmentConfig['redis'];
  customOptions?: Partial<RedisOptions>;
}

@Module({
  imports: [
    NestRedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: createRedisFactory({
          dbKey: 'authDB',
        }),
      },
      AUTH_REDIS_CONNECTION,
    ),
    NestRedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: createRedisFactory({
          dbKey: 'meetingRoomDB',
        }),
      },
      MEETING_ROOM_REDIS_CONNECTION,
    ),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}

function createRedisFactory(config: RedisInstanceConfig) {
  return (
    configService: ConfigService<EnvironmentConfig>,
  ): RedisModuleOptions => {
    const redisConfig = configService.get<EnvironmentConfig['redis']>('redis');

    if (!redisConfig) {
      throw new Error('Redis 설정이 누락되었습니다.');
    }

    const db = redisConfig[config.dbKey] as number;

    // 기본 옵션
    const baseRedisOptions: RedisOptions = {
      db,
      reconnectOnError: (err) => {
        console.error(`Redis [${config.dbKey}] 연결 오류 발생: ${err}`);
        return true;
      },
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error(`Redis [${config.dbKey}] 재연결 시도 횟수 초과`);
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    };

    // 커스텀 옵션 병합
    const redisOptions: RedisOptions = {
      ...baseRedisOptions,
      ...config.customOptions,
    };

    return {
      type: 'single',
      url: redisConfig.url,
      options: redisOptions,
    };
  };
}
