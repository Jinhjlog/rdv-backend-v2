import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { authRequest } from '../helpers/api.helper';
import { registerUser, getUserId } from '../helpers/e2e.helper';
import { seedDefaultCharacter } from '../helpers/seed';

interface NotificationListResponse {
  items: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    isRead: boolean;
    createdAt: string;
  }>;
  nextCursor: string | null;
  hasNext: boolean;
}

interface UnreadCountResponse {
  count: number;
}

interface ReadNotificationResponse {
  id: string;
  isRead: boolean;
  readAt: string;
}

interface SubscriptionsResponse {
  items: Array<{
    type: string;
    isSubscribed: boolean;
  }>;
}

describe('알림 (P2)', () => {
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

  async function seedNotification(userId: string) {
    return prisma.notifications.create({
      data: {
        user_id: userId,
        type: 'MEETING' as const,
        title: '테스트 알림',
        subtitle: '테스트 알림 내용입니다',
        is_read: false,
        created_at: new Date(),
      },
    });
  }

  // ─── TC-NTF-001 ───

  it('TC-NTF-001: 알림 목록 조회 성공', async () => {
    const token = await registerUser(app, 'ntf-001');
    await new Promise((r) => setTimeout(r, 500));
    const userId = await getUserId(app, token);
    await seedNotification(userId);

    const response = await authRequest(app, token).get('/api/v1/notifications');

    expect(response.status).toBe(200);
    const body = response.body as { data: NotificationListResponse };
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(body.data.items[0].title).toBe('테스트 알림');
    expect(body.data.items[0].isRead).toBe(false);
  });

  // ─── TC-NTF-002 ───

  it('TC-NTF-002: 미읽음 알림 개수 조회 성공', async () => {
    const token = await registerUser(app, 'ntf-002');
    await new Promise((r) => setTimeout(r, 500));
    const userId = await getUserId(app, token);
    await seedNotification(userId);
    await seedNotification(userId);

    const response = await authRequest(app, token).get(
      '/api/v1/notifications/unread-count',
    );

    expect(response.status).toBe(200);
    const body = response.body as { data: UnreadCountResponse };
    expect(body.data.count).toBeGreaterThanOrEqual(2);
  });

  // ─── TC-NTF-003 ───

  it('TC-NTF-003: 개별 알림 읽음 처리 성공', async () => {
    const token = await registerUser(app, 'ntf-003');
    await new Promise((r) => setTimeout(r, 500));
    const userId = await getUserId(app, token);
    const notification = await seedNotification(userId);

    const response = await authRequest(app, token).patch(
      `/api/v1/notifications/${notification.id}/read`,
    );

    expect(response.status).toBe(200);
    const body = response.body as { data: ReadNotificationResponse };
    expect(body.data.isRead).toBe(true);
    expect(body.data.readAt).toBeDefined();
  });

  // ─── TC-NTF-004 ───

  it('TC-NTF-004: 타인의 알림 읽음 처리 시 400', async () => {
    const ownerToken = await registerUser(app, 'ntf-004-owner', '소유자');
    const otherToken = await registerUser(app, 'ntf-004-other', '타인');
    await new Promise((r) => setTimeout(r, 500));
    const ownerId = await getUserId(app, ownerToken);
    const notification = await seedNotification(ownerId);

    const response = await authRequest(app, otherToken).patch(
      `/api/v1/notifications/${notification.id}/read`,
    );

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'NOTIFICATION_ACCESS_DENIED',
    );
  });

  // ─── TC-NTF-005 ───

  it('TC-NTF-005: 알림 구독 설정 조회 성공', async () => {
    const token = await registerUser(app, 'ntf-005');
    await new Promise((r) => setTimeout(r, 500));

    const response = await authRequest(app, token).get(
      '/api/v1/notifications/subscriptions',
    );

    expect(response.status).toBe(200);
    const body = response.body as { data: SubscriptionsResponse };
    expect(body.data.items).toBeDefined();
    expect(body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(body.data.items[0].type).toBeDefined();
    expect(body.data.items[0].isSubscribed).toBeDefined();
  });
});
