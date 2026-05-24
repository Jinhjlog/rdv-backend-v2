import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type { TestDbConfig } from '../types/global';

const CONFIG_PATH = path.join(__dirname, '..', '.test-db-config.json');

const config = JSON.parse(
  fs.readFileSync(CONFIG_PATH, 'utf-8'),
) as TestDbConfig;

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

process.env.NODE_ENV = 'test';

// Database
process.env.DATABASE_URL = config.databaseUrl;
process.env.DIRECT_URL = config.databaseUrl;

// Redis (테스트에서는 JWT Redis 저장 비활성화)
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_AUTH_DB = '0';
process.env.REDIS_MEETING_ROOM_DB = '1';
process.env.REDIS_QUEUE_DB = '15';

// Queue (BullMQ 대신 Cloud Tasks 드라이버로 Redis 연결 방지)
process.env.QUEUE_DRIVER = 'cloud-tasks';
process.env.GCP_PROJECT_ID = 'test-project';
process.env.GCP_LOCATION = 'asia-northeast1';
process.env.CLOUD_TASKS_INVOKER_SA =
  'test@test-project.iam.gserviceaccount.com';
process.env.CLOUD_TASKS_TARGET_URL =
  'http://localhost:3000/internal/queue/event';

// JWT
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '3600';
process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '3600';
process.env.ENABLE_REFRESH_TOKEN = 'false';
process.env.ENABLE_BLACKLIST = 'false';

// Firebase (Mock으로 대체되므로 더미 값)
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = privateKey;
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';

// App Security
process.env.APP_API_KEY = 'test-api-key';
process.env.ADMIN_API_KEY = 'test-admin-api-key';
process.env.ATTESTATION_ENABLED = 'false';
process.env.GOOGLE_PACKAGE_NAME = 'com.eodigae.app';

// Logger
process.env.LOG_LEVEL = 'error';
