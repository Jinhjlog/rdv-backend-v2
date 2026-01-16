import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  AUTH_REDIS_CONNECTION,
  MEETING_ROOM_REDIS_CONNECTION,
} from '../redis.module';

/**
 * 인증/세션용 Redis 주입 데코레이터
 */
export const InjectAuthRedis = () => InjectRedis(AUTH_REDIS_CONNECTION);

/**
 * 미팅룸용 Redis 주입 데코레이터
 */
export const InjectMeetingRoomRedis = () =>
  InjectRedis(MEETING_ROOM_REDIS_CONNECTION);
