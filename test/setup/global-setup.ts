import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.join(__dirname, '..', '.test-db-config.json');
const PROJECT_ROOT = path.join(__dirname, '..', '..');

export default async function globalSetup() {
  console.log('\n🐳 PostgreSQL + Redis 테스트 컨테이너 시작 중...');

  const [pgContainer, redisContainer] = await Promise.all([
    new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('test_rdv')
      .withUsername('test')
      .withPassword('test123')
      .start(),
    new RedisContainer('redis:7-alpine').start(),
  ]);

  const container = pgContainer;
  const databaseUrl = container.getConnectionUri();
  const redisUrl = redisContainer.getConnectionUrl();

  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getPassword(),
      databaseUrl,
      redisUrl,
    }),
  );

  console.log('🔧 PostgreSQL 확장 및 스키마 생성 중...');
  const result = await container.exec([
    'psql',
    '-U',
    'test',
    '-d',
    'test_rdv',
    '-c',
    `
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY,
        instance_id UUID,
        aud VARCHAR(255),
        role VARCHAR(255),
        email VARCHAR(255),
        encrypted_password VARCHAR(255),
        email_confirmed_at TIMESTAMPTZ,
        raw_app_meta_data JSONB,
        raw_user_meta_data JSONB,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        phone VARCHAR(255) UNIQUE,
        phone_confirmed_at TIMESTAMPTZ,
        confirmed_at TIMESTAMPTZ,
        is_sso_user BOOLEAN NOT NULL DEFAULT FALSE,
        is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
        deleted_at TIMESTAMPTZ,
        is_super_admin BOOLEAN,
        last_sign_in_at TIMESTAMPTZ,
        banned_until TIMESTAMPTZ
      );
    `,
  ]);

  if (result.exitCode !== 0) {
    console.error('확장/스키마 생성 실패:', result.output);
    throw new Error('PostgreSQL 확장 생성 실패');
  }

  console.log('📦 Prisma 스키마 적용 중...');
  execSync(`npx prisma db push --skip-generate --accept-data-loss`, {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      DIRECT_URL: databaseUrl,
    },
    stdio: 'pipe',
    cwd: PROJECT_ROOT,
  });

  global.__POSTGRES_CONTAINER__ = container;
  global.__REDIS_CONTAINER__ = redisContainer;

  console.log(
    `✅ 테스트 컨테이너 준비 완료 (PostgreSQL: ${container.getMappedPort(5432)}, Redis: ${redisContainer.getMappedPort(6379)})\n`,
  );
}
