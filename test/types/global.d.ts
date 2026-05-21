import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export interface TestDbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  databaseUrl: string;
}

declare global {
  var __POSTGRES_CONTAINER__: StartedPostgreSqlContainer | undefined;
}
