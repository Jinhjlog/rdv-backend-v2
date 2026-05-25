import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { authRequest } from '../helpers/api.helper';
import {
  registerUser,
  createGroup,
  inviteAndJoin,
  getUserId,
  futureTime,
} from '../helpers/e2e.helper';
import { EventDetailResponse, EventListResponse } from '../helpers/types';
import { seedDefaultCharacter } from '../helpers/seed';

describe('일정 (P1)', () => {
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

  async function createEvent(
    token: string,
    groupId: string,
    minutesFromNow = 30,
    title = '테스트일정',
  ) {
    const res = await authRequest(app, token)
      .post(`/api/v1/groups/${groupId}/events`)
      .send({
        title,
        description: '테스트용 일정입니다',
        eventTime: futureTime(minutesFromNow),
        location: {
          address: '서울시 강남구',
          detail: '2층',
          latitude: '37.123456',
          longitude: '127.123456',
        },
      });
    expect(res.status).toBe(201);
    return res.body as EventDetailResponse;
  }

  // ─── TC-EVT-001 ───

  it('TC-EVT-001: 일정 생성 성공', async () => {
    const token = await registerUser(app, 'evt-001');
    const group = await createGroup(app, token);

    const response = await authRequest(app, token)
      .post(`/api/v1/groups/${group.id}/events`)
      .send({
        title: '테스트일정',
        description: '테스트용 일정입니다',
        eventTime: futureTime(30),
        location: {
          address: '서울시 강남구',
          detail: '2층',
          latitude: '37.123456',
          longitude: '127.123456',
        },
      });

    expect(response.status).toBe(201);
    const body = response.body as EventDetailResponse;
    expect(body.id).toBeDefined();
    expect(body.title).toBe('테스트일정');
    expect(body.status).toBe('RECRUITING');
    expect(body.participants.length).toBeGreaterThanOrEqual(1);
  });

  // ─── TC-EVT-001-1 ───

  it('TC-EVT-001-1: 일정 생성 시 생성자가 참여자에 정확히 1번만 등록된다', async () => {
    const token = await registerUser(app, 'evt-001-1');
    const group = await createGroup(app, token);
    const userId = await getUserId(app, token);

    const event = await createEvent(token, group.id);

    const response = await authRequest(app, token).get(
      `/api/v1/events/${event.id}`,
    );

    expect(response.status).toBe(200);
    const body = response.body as EventDetailResponse;
    const creatorEntries = body.participants.filter(
      (p) => p.userId === userId,
    );
    expect(creatorEntries).toHaveLength(1);
  });

  // ─── TC-EVT-002 ───

  it('TC-EVT-002: 모집중 일정 최대 3개 초과 시 400', async () => {
    const token = await registerUser(app, 'evt-002');
    const group = await createGroup(app, token);

    await createEvent(token, group.id, 60, '일정1');
    await createEvent(token, group.id, 120, '일정2');
    await createEvent(token, group.id, 180, '일정3');

    const response = await authRequest(app, token)
      .post(`/api/v1/groups/${group.id}/events`)
      .send({
        title: '일정4',
        description: '4번째 일정',
        eventTime: futureTime(240),
        location: {
          address: '서울시',
          detail: '1층',
          latitude: '37.123456',
          longitude: '127.123456',
        },
      });

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'MAX_RECURRING_EVENTS_EXCEEDED',
    );
  });

  // ─── TC-EVT-003 ───

  it('TC-EVT-003: 일정 목록 조회 성공', async () => {
    const token = await registerUser(app, 'evt-003');
    const group = await createGroup(app, token);
    await createEvent(token, group.id);

    const response = await authRequest(app, token).get(
      `/api/v1/groups/${group.id}/events`,
    );

    expect(response.status).toBe(200);
    const body = response.body as EventListResponse;
    expect(body.items.length).toBeGreaterThanOrEqual(1);
  });

  // ─── TC-EVT-004 ───

  it('TC-EVT-004: 일정 상세 조회 성공', async () => {
    const token = await registerUser(app, 'evt-004');
    const group = await createGroup(app, token);
    const event = await createEvent(token, group.id);

    const response = await authRequest(app, token).get(
      `/api/v1/events/${event.id}`,
    );

    expect(response.status).toBe(200);
    const body = response.body as EventDetailResponse;
    expect(body.id).toBe(event.id);
    expect(body.title).toBe('테스트일정');
    expect(body.status).toBe('RECRUITING');
    expect(body.participants).toBeDefined();
  });

  // ─── TC-EVT-005 ───

  it('TC-EVT-005: 일정 수정 성공 (생성자)', async () => {
    const token = await registerUser(app, 'evt-005');
    const group = await createGroup(app, token);
    const event = await createEvent(token, group.id);

    const response = await authRequest(app, token)
      .patch(`/api/v1/events/${event.id}`)
      .send({ title: '수정된일정' });

    expect(response.status).toBe(200);
    expect((response.body as EventDetailResponse).title).toBe('수정된일정');
  });

  // ─── TC-EVT-006 ───

  it('TC-EVT-006: 생성자가 아닌 사용자가 일정 수정 시 400', async () => {
    const ownerToken = await registerUser(app, 'evt-006-owner', '모임장');
    const memberToken = await registerUser(app, 'evt-006-member', '멤버');
    const group = await createGroup(app, ownerToken);
    await inviteAndJoin(app, ownerToken, memberToken, group.id);
    const event = await createEvent(ownerToken, group.id);

    const response = await authRequest(app, memberToken)
      .patch(`/api/v1/events/${event.id}`)
      .send({ title: '수정시도' });

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'NOT_EVENT_CREATOR',
    );
  });

  // ─── TC-EVT-007 ───

  it('TC-EVT-007: 일정 삭제 성공 (생성자)', async () => {
    const token = await registerUser(app, 'evt-007');
    const group = await createGroup(app, token);
    const event = await createEvent(token, group.id);

    const response = await authRequest(app, token).delete(
      `/api/v1/events/${event.id}`,
    );

    expect(response.status).toBe(204);
  });

  // ─── TC-EVT-008 ───

  it('TC-EVT-008: 일정 참여 성공', async () => {
    const ownerToken = await registerUser(app, 'evt-008-owner', '모임장');
    const memberToken = await registerUser(app, 'evt-008-member', '멤버');
    const group = await createGroup(app, ownerToken);
    await inviteAndJoin(app, ownerToken, memberToken, group.id);
    const event = await createEvent(ownerToken, group.id);

    const response = await authRequest(app, memberToken).post(
      `/api/v1/events/${event.id}/participants`,
    );

    expect(response.status).toBe(201);
    const body = response.body as EventDetailResponse;
    const memberId = await getUserId(app, memberToken);
    const joined = body.participants.find((p) => p.userId === memberId);
    expect(joined).toBeDefined();
  });

  // ─── TC-EVT-009 ───

  it('TC-EVT-009: 이미 참여 중인 일정에 재참여 시 400', async () => {
    const ownerToken = await registerUser(app, 'evt-009-owner', '모임장');
    const memberToken = await registerUser(app, 'evt-009-member', '멤버');
    const group = await createGroup(app, ownerToken);
    await inviteAndJoin(app, ownerToken, memberToken, group.id);
    const event = await createEvent(ownerToken, group.id);

    await authRequest(app, memberToken).post(
      `/api/v1/events/${event.id}/participants`,
    );

    const response = await authRequest(app, memberToken).post(
      `/api/v1/events/${event.id}/participants`,
    );

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'ALREADY_PARTICIPATING',
    );
  });

  // ─── TC-EVT-010 ───

  it('TC-EVT-010: 일정 참여 철회 성공', async () => {
    const ownerToken = await registerUser(app, 'evt-010-owner', '모임장');
    const memberToken = await registerUser(app, 'evt-010-member', '멤버');
    const group = await createGroup(app, ownerToken);
    await inviteAndJoin(app, ownerToken, memberToken, group.id);
    const event = await createEvent(ownerToken, group.id);

    await authRequest(app, memberToken).post(
      `/api/v1/events/${event.id}/participants`,
    );

    const response = await authRequest(app, memberToken).delete(
      `/api/v1/events/${event.id}/participants`,
    );

    expect(response.status).toBe(204);
  });

  // ─── TC-EVT-011 ───

  it('TC-EVT-011: 생성자가 참여 철회 시 400', async () => {
    const token = await registerUser(app, 'evt-011');
    const group = await createGroup(app, token);
    const event = await createEvent(token, group.id);

    const response = await authRequest(app, token).delete(
      `/api/v1/events/${event.id}/participants`,
    );

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'CREATOR_CANNOT_WITHDRAW',
    );
  });
});
