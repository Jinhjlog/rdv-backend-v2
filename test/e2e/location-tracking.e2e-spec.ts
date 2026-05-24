import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { authRequest } from '../helpers/api.helper';
import { registerUser, createGroup } from '../helpers/e2e.helper';
import { seedDefaultCharacter } from '../helpers/seed';

interface LocationListResponse {
  items: Array<{
    userId: string;
    nickname: string;
    nameTag: string;
    characterCode: string;
    latitude: string | null;
    longitude: string | null;
    lastUpdatedAt: string | null;
  }>;
}

describe('위치 추적 (P3)', () => {
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

  async function seedInProgressEvent(groupId: string, creatorId: string) {
    return prisma.events.create({
      data: {
        group_id: groupId,
        created_by: creatorId,
        title: '진행중 일정',
        description: '테스트용',
        event_time: new Date(),
        tracking_start_time: new Date(Date.now() - 15 * 60 * 1000),
        end_time: new Date(Date.now() + 60 * 1000),
        location_address: '서울시 강남구',
        location_detail: '2층',
        location_latitude: 37.123456,
        location_longitude: 127.123456,
        status: 'IN_PROGRESS',
        is_participant_checked: true,
        updated_at: new Date(),
      },
    });
  }

  async function seedLocationTracking(
    eventId: string,
    userId: string,
    nickname: string,
  ) {
    return prisma.location_trackings.create({
      data: {
        event_id: eventId,
        user_id: userId,
        nickname,
        name_tag: '#0001',
        character_code: 'default_char',
      },
    });
  }

  async function getUserId(token: string): Promise<string> {
    const res = await authRequest(app, token).get('/api/v1/users/me');
    return (res.body as { id: string }).id;
  }

  // ─── TC-LOC-001 ───

  it('TC-LOC-001: 일정별 참여자 위치 목록 조회 성공', async () => {
    const token = await registerUser(app, 'loc-001');
    await new Promise((r) => setTimeout(r, 500));
    const group = await createGroup(app, token);
    const userId = await getUserId(token);
    const event = await seedInProgressEvent(group.id, userId);
    await seedLocationTracking(event.id, userId, '테스터');

    const response = await authRequest(app, token).get(
      `/api/v1/events/${event.id}/location-trackings`,
    );

    expect(response.status).toBe(200);
    const body = response.body as LocationListResponse;
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items[0].userId).toBe(userId);
    expect(body.items[0].nickname).toBe('테스터');
  });

  // ─── TC-LOC-002 ───

  it('TC-LOC-002: 위치 갱신 성공', async () => {
    const token = await registerUser(app, 'loc-002');
    await new Promise((r) => setTimeout(r, 500));
    const group = await createGroup(app, token);
    const userId = await getUserId(token);
    const event = await seedInProgressEvent(group.id, userId);
    await seedLocationTracking(event.id, userId, '테스터');

    const response = await authRequest(app, token)
      .patch(`/api/v1/events/${event.id}/location-trackings`)
      .send({ latitude: '37.654321', longitude: '127.654321' });

    expect(response.status).toBe(204);

    const record = await prisma.location_trackings.findFirst({
      where: { event_id: event.id, user_id: userId },
    });
    expect(record!.latitude!.toString()).toBe('37.654321');
    expect(record!.longitude!.toString()).toBe('127.654321');
  });

  // ─── TC-LOC-003 ───

  it('TC-LOC-003: 존재하지 않는 위치 추적 레코드에 위치 갱신 시 404', async () => {
    const token = await registerUser(app, 'loc-003');
    await new Promise((r) => setTimeout(r, 500));
    const group = await createGroup(app, token);
    const userId = await getUserId(token);
    const event = await seedInProgressEvent(group.id, userId);

    const response = await authRequest(app, token)
      .patch(`/api/v1/events/${event.id}/location-trackings`)
      .send({ latitude: '37.123456', longitude: '127.123456' });

    expect(response.status).toBe(404);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'LOCATION_TRACKING_NOT_FOUND',
    );
  });

  // ─── TC-LOC-004 ───

  it('TC-LOC-004: 모임 외부 멤버가 위치 목록 조회 시 403', async () => {
    const ownerToken = await registerUser(app, 'loc-004-owner', '모임장');
    const outsiderToken = await registerUser(app, 'loc-004-outsider', '외부인');
    await new Promise((r) => setTimeout(r, 500));
    const group = await createGroup(app, ownerToken);
    const ownerId = await getUserId(ownerToken);
    const event = await seedInProgressEvent(group.id, ownerId);
    await seedLocationTracking(event.id, ownerId, '모임장');

    const response = await authRequest(app, outsiderToken).get(
      `/api/v1/events/${event.id}/location-trackings`,
    );

    expect(response.status).toBe(403);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'NOT_GROUP_MEMBER',
    );
  });
});
