import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { authRequest } from '../helpers/api.helper';
import { registerUser } from '../helpers/e2e.helper';
import { seedDefaultCharacter } from '../helpers/seed';

describe('디바이스 토큰 (P3)', () => {
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
    await seedDefaultCharacter(prisma);
  });

  // ─── TC-DTK-001 ───

  it('TC-DTK-001: 디바이스 토큰 등록 성공', async () => {
    const token = await registerUser(app, 'dtk-001');
    await new Promise((r) => setTimeout(r, 500));

    const response = await authRequest(app, token)
      .post('/api/v1/device-tokens')
      .send({ token: 'fcm-test-token-001', platform: 'ANDROID' });

    expect(response.status).toBe(204);

    const record = await prisma.device_tokens.findFirst({
      where: { token: 'fcm-test-token-001' },
    });
    expect(record).not.toBeNull();
    expect(record!.platform).toBe('ANDROID');
  });

  // ─── TC-DTK-002 ───

  it('TC-DTK-002: 동일 사용자 토큰 재등록 시 업데이트', async () => {
    const token = await registerUser(app, 'dtk-002');
    await new Promise((r) => setTimeout(r, 500));

    await authRequest(app, token)
      .post('/api/v1/device-tokens')
      .send({ token: 'fcm-old-token', platform: 'ANDROID' });

    const response = await authRequest(app, token)
      .post('/api/v1/device-tokens')
      .send({ token: 'fcm-new-token', platform: 'IOS' });

    expect(response.status).toBe(204);

    const records = await prisma.device_tokens.findMany({
      where: { token: { in: ['fcm-old-token', 'fcm-new-token'] } },
    });
    expect(records).toHaveLength(1);
    expect(records[0].token).toBe('fcm-new-token');
    expect(records[0].platform).toBe('IOS');
  });

  // ─── TC-DTK-003 ───

  it('TC-DTK-003: 디바이스 토큰 삭제 성공', async () => {
    const token = await registerUser(app, 'dtk-003');
    await new Promise((r) => setTimeout(r, 500));

    await authRequest(app, token)
      .post('/api/v1/device-tokens')
      .send({ token: 'fcm-delete-token', platform: 'ANDROID' });

    const response = await authRequest(app, token)
      .delete('/api/v1/device-tokens')
      .send({ token: 'fcm-delete-token' });

    expect(response.status).toBe(204);

    const record = await prisma.device_tokens.findFirst({
      where: { token: 'fcm-delete-token' },
    });
    expect(record).toBeNull();
  });
});
