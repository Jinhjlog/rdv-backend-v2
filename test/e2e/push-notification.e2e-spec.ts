import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { adminRequest, unauthenticatedRequest } from '../helpers/api.helper';
import { registerUser, getUserId } from '../helpers/e2e.helper';
import { seedDefaultCharacter } from '../helpers/seed';

interface SendTestPushResponse {
  success: boolean;
  message: string;
}

describe('푸시 알림 (P3)', () => {
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

  async function seedDeviceToken(userId: string) {
    await prisma.device_tokens.create({
      data: {
        user_id: userId,
        token: `fcm-push-test-token-${userId}`,
        platform: 'ANDROID',
        last_used_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // ─── TC-PUSH-001 ───

  it('TC-PUSH-001: 테스트 푸시 발송 성공', async () => {
    const token = await registerUser(app, 'push-001');
    await new Promise((r) => setTimeout(r, 500));
    const userId = await getUserId(app, token);
    await seedDeviceToken(userId);

    const response = await adminRequest(app)
      .post('/api/v1/push-notifications/test')
      .send({
        userId,
        title: '테스트 알림',
        body: '테스트 푸시입니다',
      });

    expect(response.status).toBe(201);
    const body = response.body as SendTestPushResponse;
    expect(body.success).toBeDefined();
    expect(body.message).toBeDefined();
  });

  // ─── TC-PUSH-002 ───

  it('TC-PUSH-002: API Key 없이 테스트 푸시 발송 시 401', async () => {
    const response = await unauthenticatedRequest(app)
      .post('/api/v1/push-notifications/test')
      .send({
        userId: 'some-user-id',
        title: '테스트',
        body: '테스트',
      });

    expect(response.status).toBe(401);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'INVALID_API_KEY',
    );
  });
});
