import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { publicRequest, authRequest } from '../helpers/api.helper';
import { seedDefaultCharacter } from '../helpers/seed';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface GroupDetailResponse {
  id: string;
  name: string;
  description: string;
  iconCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  members: Array<{
    id: string;
    userId: string;
    nickname: string;
    role: string;
  }>;
}

interface GroupListResponse {
  items: Array<{ id: string; name: string }>;
}

interface InviteCodeResponse {
  code: string;
  expiresAt: string;
}

describe('모임 (P0)', () => {
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

  async function registerUser(deviceId: string, nickname = '테스터') {
    const res = await publicRequest(app).post('/api/v2/auth/register').send({
      deviceId,
      nickname,
      preferredThemeColor: '#FF0000',
    });
    expect(res.status).toBe(201);
    return (res.body as AuthResponse).accessToken;
  }

  async function createGroup(token: string, name = '테스트모임') {
    const res = await authRequest(app, token).post('/api/v1/groups').send({
      name,
      description: '테스트용 모임',
      iconCode: 'icon_01',
    });
    expect(res.status).toBe(201);
    return res.body as GroupDetailResponse;
  }

  async function createInviteCode(token: string, groupId: string) {
    const res = await authRequest(app, token).post(
      `/api/v1/groups/${groupId}/invite-codes`,
    );
    expect(res.status).toBe(201);
    return res.body as InviteCodeResponse;
  }

  async function joinGroup(token: string, inviteCode: string) {
    const res = await authRequest(app, token)
      .post('/api/v1/groups/join')
      .send({ inviteCode });
    expect(res.status).toBe(201);
    return res.body as GroupDetailResponse;
  }

  async function getUserId(token: string) {
    const res = await authRequest(app, token).get('/api/v1/users/me');
    return (res.body as { id: string }).id;
  }

  // ─── TC-GRP-001 ───

  it('TC-GRP-001: 모임 생성 성공', async () => {
    const token = await registerUser('grp-001');

    const response = await authRequest(app, token).post('/api/v1/groups').send({
      name: '테스트모임',
      description: '테스트용 모임입니다',
      iconCode: 'icon_01',
    });

    expect(response.status).toBe(201);
    const body = response.body as GroupDetailResponse;
    expect(body.id).toBeDefined();
    expect(body.name).toBe('테스트모임');
    expect(body.members).toHaveLength(1);
    expect(body.members[0].role).toBe('OWNER');
  });

  // ─── TC-GRP-002 ───

  it('TC-GRP-002: 이미 모임장인 사용자가 모임 생성 시 409', async () => {
    const token = await registerUser('grp-002');
    await createGroup(token);

    const response = await authRequest(app, token).post('/api/v1/groups').send({
      name: '두번째모임',
      description: '두번째 모임입니다',
      iconCode: 'icon_02',
    });

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'GROUP_NOT_ALLOWED_MULTIPLE_OWNERSHIP',
    );
  });

  // ─── TC-GRP-003 ───

  it('TC-GRP-003: 모임 목록 조회 성공', async () => {
    const token = await registerUser('grp-003');
    await createGroup(token, '나의모임');

    const response = await authRequest(app, token).get('/api/v1/groups');

    expect(response.status).toBe(200);
    const body = response.body as GroupListResponse;
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items[0].name).toBe('나의모임');
  });

  // ─── TC-GRP-004 ───

  it('TC-GRP-004: 모임 상세 조회 성공', async () => {
    const token = await registerUser('grp-004');
    const group = await createGroup(token);

    const response = await authRequest(app, token).get(
      `/api/v1/groups/${group.id}`,
    );

    expect(response.status).toBe(200);
    const body = response.body as GroupDetailResponse;
    expect(body.id).toBe(group.id);
    expect(body.name).toBe('테스트모임');
    expect(body.members).toBeDefined();
  });

  // ─── TC-GRP-005 ───

  it('TC-GRP-005: 모임 정보 수정 성공 (모임장)', async () => {
    const token = await registerUser('grp-005');
    const group = await createGroup(token);

    const response = await authRequest(app, token)
      .patch(`/api/v1/groups/${group.id}`)
      .send({ name: '수정된모임' });

    expect(response.status).toBe(200);
    expect((response.body as GroupDetailResponse).name).toBe('수정된모임');
  });

  // ─── TC-GRP-006 ───

  it('TC-GRP-006: 초대 코드 생성 성공', async () => {
    const token = await registerUser('grp-006');
    const group = await createGroup(token);

    const response = await authRequest(app, token).post(
      `/api/v1/groups/${group.id}/invite-codes`,
    );

    expect(response.status).toBe(201);
    const body = response.body as InviteCodeResponse;
    expect(body.code).toBeDefined();
    expect(body.expiresAt).toBeDefined();
  });

  // ─── TC-GRP-007 ───

  it('TC-GRP-007: 초대 코드로 모임 참여 성공', async () => {
    const ownerToken = await registerUser('grp-007-owner', '모임장');
    const memberToken = await registerUser('grp-007-member', '멤버');
    const group = await createGroup(ownerToken);
    const invite = await createInviteCode(ownerToken, group.id);

    const response = await authRequest(app, memberToken)
      .post('/api/v1/groups/join')
      .send({ inviteCode: invite.code });

    expect(response.status).toBe(201);
    const body = response.body as GroupDetailResponse;
    expect(body.members).toHaveLength(2);
    const memberRoles = body.members.map((m) => m.role);
    expect(memberRoles).toContain('OWNER');
    expect(memberRoles).toContain('MEMBER');
  });

  // ─── TC-GRP-008 ───

  it('TC-GRP-008: 사용된 초대 코드로 참여 시 400', async () => {
    const ownerToken = await registerUser('grp-008-owner', '모임장');
    const member1Token = await registerUser('grp-008-m1', '멤버일');
    const member2Token = await registerUser('grp-008-m2', '멤버이');
    const group = await createGroup(ownerToken);
    const invite = await createInviteCode(ownerToken, group.id);

    await joinGroup(member1Token, invite.code);

    const response = await authRequest(app, member2Token)
      .post('/api/v1/groups/join')
      .send({ inviteCode: invite.code });

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'INVITE_CODE_EXPIRED',
    );
  });

  // ─── TC-GRP-009 ───

  it('TC-GRP-009: 모임장이 멤버 강퇴 성공', async () => {
    const ownerToken = await registerUser('grp-009-owner', '모임장');
    const memberToken = await registerUser('grp-009-member', '멤버');
    const group = await createGroup(ownerToken);
    const invite = await createInviteCode(ownerToken, group.id);
    await joinGroup(memberToken, invite.code);

    const memberId = await getUserId(memberToken);

    const response = await authRequest(app, ownerToken).delete(
      `/api/v1/groups/${group.id}/members/${memberId}`,
    );

    expect(response.status).toBe(204);
  });

  // ─── TC-GRP-010 ───

  it('TC-GRP-010: 모임장 본인 강퇴 시 400', async () => {
    const ownerToken = await registerUser('grp-010-owner', '모임장');
    const group = await createGroup(ownerToken);
    const ownerId = await getUserId(ownerToken);

    const response = await authRequest(app, ownerToken).delete(
      `/api/v1/groups/${group.id}/members/${ownerId}`,
    );

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'GROUP_OWNER_CANNOT_BE_REMOVED',
    );
  });

  // ─── TC-GRP-011 ───

  it('TC-GRP-011: 일반 멤버 모임 탈퇴 성공', async () => {
    const ownerToken = await registerUser('grp-011-owner', '모임장');
    const memberToken = await registerUser('grp-011-member', '멤버');
    const group = await createGroup(ownerToken);
    const invite = await createInviteCode(ownerToken, group.id);
    await joinGroup(memberToken, invite.code);

    const response = await authRequest(app, memberToken).delete(
      `/api/v1/groups/${group.id}/leave`,
    );

    expect(response.status).toBe(204);
  });

  // ─── TC-GRP-012 ───

  it('TC-GRP-012: 모임장 탈퇴 시 400', async () => {
    const ownerToken = await registerUser('grp-012-owner', '모임장');
    const group = await createGroup(ownerToken);

    const response = await authRequest(app, ownerToken).delete(
      `/api/v1/groups/${group.id}/leave`,
    );

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'GROUP_OWNER_CANNOT_LEAVE',
    );
  });

  // ─── TC-GRP-013 ───

  it('TC-GRP-013: 모임장 이전 성공', async () => {
    const ownerToken = await registerUser('grp-013-owner', '모임장');
    const memberToken = await registerUser('grp-013-member', '멤버');
    const group = await createGroup(ownerToken);
    const invite = await createInviteCode(ownerToken, group.id);
    await joinGroup(memberToken, invite.code);

    const memberId = await getUserId(memberToken);

    const response = await authRequest(app, ownerToken)
      .post(`/api/v1/groups/${group.id}/transfer-ownership`)
      .send({ newOwnerId: memberId });

    expect(response.status).toBe(201);
    const body = response.body as GroupDetailResponse;
    expect(body.ownerId).toBe(memberId);

    const ownerId = await getUserId(ownerToken);
    const newOwner = body.members.find((m) => m.userId === memberId);
    const oldOwner = body.members.find((m) => m.userId === ownerId);
    expect(newOwner?.role).toBe('OWNER');
    expect(oldOwner?.role).toBe('MEMBER');
  });

  // ─── TC-GRP-014 ───

  it('TC-GRP-014: 본인에게 모임장 이전 시 400', async () => {
    const ownerToken = await registerUser('grp-014-owner', '모임장');
    const group = await createGroup(ownerToken);
    const ownerId = await getUserId(ownerToken);

    const response = await authRequest(app, ownerToken)
      .post(`/api/v1/groups/${group.id}/transfer-ownership`)
      .send({ newOwnerId: ownerId });

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'GROUP_OWNER_CANNOT_TRANSFER_TO_SELF',
    );
  });

  // ─── TC-GRP-015 ───

  it('TC-GRP-015: 다른 멤버가 있는 모임 삭제 시 400', async () => {
    const ownerToken = await registerUser('grp-015-owner', '모임장');
    const memberToken = await registerUser('grp-015-member', '멤버');
    const group = await createGroup(ownerToken);
    const invite = await createInviteCode(ownerToken, group.id);
    await joinGroup(memberToken, invite.code);

    const response = await authRequest(app, ownerToken).delete(
      `/api/v1/groups/${group.id}`,
    );

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'GROUP_HAS_OTHER_MEMBERS',
    );
  });

  // ─── TC-GRP-016 ───

  it('TC-GRP-016: 모임장 혼자 남은 모임 삭제 성공', async () => {
    const ownerToken = await registerUser('grp-016-owner', '모임장');
    const group = await createGroup(ownerToken);

    const response = await authRequest(app, ownerToken).delete(
      `/api/v1/groups/${group.id}`,
    );

    expect(response.status).toBe(204);
  });
});
