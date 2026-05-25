import { InjectRedis } from '@nestjs-modules/ioredis';
import { AUTH_REDIS_CONNECTION } from '../redis.module';

/**
 * 인증/세션용 Redis 주입 데코레이터
 */
export const InjectAuthRedis = () => InjectRedis(AUTH_REDIS_CONNECTION);
