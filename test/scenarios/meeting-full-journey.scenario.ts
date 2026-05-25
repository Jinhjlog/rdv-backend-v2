/**
 * SCN-001: 모임 → 일정 → 위치 추적 전체 여정
 *
 * 배우:     모임장(owner), 멤버(member)
 * 전제:     디폴트 캐릭터 시드
 * 성공 조건: 모임 생성 → 멤버 참여 → 일정 생성/참여 → 출발 → 위치 전송 → 도착 → 위치 조회
 *
 * Step 1  모임장 가입 + 모임 생성
 * Step 2  멤버 가입 + 초대코드로 모임 참여
 * Step 3  일정 생성 + 멤버 일정 참여
 * Step 4  일정을 IN_PROGRESS 상태로 전환 (DB 직접)
 * Step 5  멤버 출발 (DEPARTED)
 * Step 6  위치 전송 (PATCH)
 * Step 7  위치 목록 조회 (pollingIntervalSeconds 포함)
 * Step 8  멤버 도착 (50m 이내)
 */

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
} from '../helpers/e2e.helper';
import { seedDefaultCharacter } from '../helpers/seed';
import { EventDetailResponse } from '../helpers/types';

const DESTINATION = { latitude: '37.123456', longitude: '127.123456' };
const MEMBER_MOVING = { latitude: '37.123400', longitude: '127.123400' };
const MEMBER_ARRIVED = { latitude: '37.123456', longitude: '127.123456' };

describe('SCN-001: 모임 → 일정 → 위치 추적 전체 여정', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let ownerToken: string;
  let memberToken: string;
  let ownerId: string;
  let memberId: string;
  let groupId: string;
  let eventId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await cleanDatabase(prisma);
    await seedDefaultCharacter(prisma);
  });

  afterAll(async () => {
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    await cleanDatabase(prisma);
    if (app) await app.close();
  });

  // ── Step 1 ──

  it('Step 1: 모임장 가입 및 모임 생성', async () => {
    ownerToken = await registerUser(app, 'scn-001-owner', '모임장');
    await new Promise((r) => setTimeout(r, 500));

    const group = await createGroup(app, ownerToken);
    groupId = group.id;
    ownerId = await getUserId(app, ownerToken);

    expect(groupId).toBeDefined();
    expect(ownerId).toBeDefined();
  });

  // ── Step 2 ──

  it('Step 2: 멤버 가입 및 초대코드로 모임 참여', async () => {
    expect(groupId).toBeDefined();

    memberToken = await registerUser(app, 'scn-001-member', '멤버');
    await new Promise((r) => setTimeout(r, 500));

    memberId = await getUserId(app, memberToken);
    await inviteAndJoin(app, ownerToken, memberToken, groupId);

    expect(memberId).toBeDefined();
  });

  // ── Step 3 ──

  it('Step 3: 일정 생성 및 멤버 참여', async () => {
    expect(groupId).toBeDefined();

    const eventTime = new Date(Date.now() + 30 * 60 * 1000);

    const createRes = await authRequest(app, ownerToken)
      .post(`/api/v1/groups/${groupId}/events`)
      .send({
        title: '시나리오 일정',
        description: '전체 여정 테스트',
        eventTime: eventTime.toISOString(),
        location: {
          address: '서울시 강남구',
          detail: '2층',
          latitude: DESTINATION.latitude,
          longitude: DESTINATION.longitude,
        },
      });

    expect(createRes.status).toBe(201);
    eventId = (createRes.body as EventDetailResponse).id;

    const joinRes = await authRequest(app, memberToken).post(
      `/api/v1/events/${eventId}/participants`,
    );
    expect(joinRes.status).toBe(201);
  });

  // ── Step 4 ──

  it('Step 4: 일정을 IN_PROGRESS 상태로 전환', async () => {
    expect(eventId).toBeDefined();

    await prisma.events.update({
      where: { id: eventId },
      data: {
        status: 'IN_PROGRESS',
        is_participant_checked: true,
      },
    });

    const event = await prisma.events.findUnique({
      where: { id: eventId },
    });
    expect(event!.status).toBe('IN_PROGRESS');
  });

  // ── Step 5 ──

  it('Step 5: 멤버 출발 (DEPARTED)', async () => {
    expect(eventId).toBeDefined();
    expect(memberToken).toBeDefined();

    const res = await authRequest(app, memberToken).post(
      `/api/v1/events/${eventId}/depart`,
    );
    expect(res.status).toBe(204);

    await new Promise((r) => setTimeout(r, 500));
  });

  // ── Step 6 ──

  it('Step 6: 위치 전송', async () => {
    expect(eventId).toBeDefined();

    const res = await authRequest(app, memberToken)
      .patch(`/api/v1/events/${eventId}/location-trackings`)
      .send(MEMBER_MOVING);

    expect(res.status).toBe(204);
  });

  // ── Step 7 ──

  it('Step 7: 위치 목록 조회 (pollingIntervalSeconds 포함)', async () => {
    expect(eventId).toBeDefined();

    const res = await authRequest(app, ownerToken).get(
      `/api/v1/events/${eventId}/location-trackings`,
    );

    expect(res.status).toBe(200);

    const body = res.body as {
      items: Array<{ userId: string; latitude: string | null }>;
      pollingIntervalSeconds: number;
    };

    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.pollingIntervalSeconds).toBeDefined();
    expect(typeof body.pollingIntervalSeconds).toBe('number');

    const memberLocation = body.items.find((i) => i.userId === memberId);
    expect(memberLocation).toBeDefined();
    expect(memberLocation!.latitude).toBeDefined();
  });

  // ── Step 8 ──

  it('Step 8: 멤버 도착 (50m 이내)', async () => {
    expect(eventId).toBeDefined();

    const res = await authRequest(app, memberToken)
      .post(`/api/v1/events/${eventId}/arrive`)
      .send(MEMBER_ARRIVED);

    expect(res.status).toBe(204);

    const detail = await authRequest(app, ownerToken).get(
      `/api/v1/events/${eventId}`,
    );
    const participant = (detail.body as EventDetailResponse).participants.find(
      (p) => p.userId === memberId,
    );
    expect(participant!.status).toBe('ARRIVED');
  });
});
