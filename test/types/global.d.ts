import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';

export interface TestDbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  databaseUrl: string;
  redisUrl: string;
}

declare global {
  var __POSTGRES_CONTAINER__: StartedPostgreSqlContainer | undefined;
  var __REDIS_CONTAINER__: StartedRedisContainer | undefined;
}
