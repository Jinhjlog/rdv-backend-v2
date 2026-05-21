import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const request: typeof import('supertest') = require('supertest');

describe('E2E 테스트 환경 검증', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    if (app) await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('앱이 정상적으로 시작된다', () => {
    expect(app).toBeDefined();
  });

  it('DB 연결이 정상 동작한다', async () => {
    const result = await prisma.$queryRaw<
      Array<{ now: Date }>
    >`SELECT NOW() as now`;
    expect(result[0].now).toBeInstanceOf(Date);
  });

  it('인증 없이 보호된 API 접근 시 401을 반환한다', async () => {
    await request(app.getHttpServer() as import('http').Server)
      .get('/api/v1/users/me')
      .expect(401);
  });

  it('cleanDatabase가 모든 데이터를 정리한다', async () => {
    await prisma.public_users.create({
      data: {
        device_id: 'test-device-cleanup',
        nickname: '테스트',
        name_tag: '#0000',
        preferred_theme_color: '#FF0000',
        character_code: 'default',
        level: 1,
        experience: 0,
        updated_at: new Date(),
      },
    });

    await cleanDatabase(prisma);

    const userCount = await prisma.public_users.count();
    expect(userCount).toBe(0);
  });
});
