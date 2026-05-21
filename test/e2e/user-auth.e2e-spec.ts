import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { publicRequest, authRequest } from '../helpers/api.helper';
import {
  seedDefaultCharacter,
  seedExtraCharacter,
  seedUser,
  grantCharacterToUser,
} from '../helpers/seed';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface UserProfileResponse {
  id: string;
  nickname: string;
  nameTag: string;
  preferredThemeColor: string;
  characterCode: string;
  level: number;
  experience: number;
}

describe('사용자 인증 & 프로필 (P0)', () => {
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

  /** 회원가입 후 accessToken 반환하는 헬퍼 */
  async function registerAndGetToken(
    deviceId: string,
    nickname = '테스터',
  ): Promise<string> {
    await seedDefaultCharacter(prisma);
    const res = await publicRequest(app).post('/api/v2/auth/register').send({
      deviceId,
      nickname,
      preferredThemeColor: '#FF0000',
    });
    expect(res.status).toBe(201);
    return (res.body as AuthResponse).accessToken;
  }

  // ─── TC-AUTH-001 ───

  it('TC-AUTH-001: 미등록 deviceId로 계정 확인 시 exists=false', async () => {
    const response = await publicRequest(app)
      .get('/api/v2/auth/check-account')
      .query({ deviceId: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ exists: false });
  });

  // ─── TC-AUTH-002 ───

  it('TC-AUTH-002: 등록된 deviceId로 계정 확인 시 exists=true', async () => {
    const user = await seedUser(prisma, { deviceId: 'existing-device-001' });

    const response = await publicRequest(app)
      .get('/api/v2/auth/check-account')
      .query({ deviceId: user.device_id });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ exists: true });
  });

  // ─── TC-AUTH-003 ───

  it('TC-AUTH-003: 신규 사용자 회원가입 성공', async () => {
    await seedDefaultCharacter(prisma);

    const response = await publicRequest(app)
      .post('/api/v2/auth/register')
      .send({
        deviceId: 'new-device-001',
        nickname: '테스터',
        preferredThemeColor: '#FF5733',
      });

    expect(response.status).toBe(201);
    const body = response.body as AuthResponse;
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  // ─── TC-AUTH-004 ───

  it('TC-AUTH-004: 이미 등록된 deviceId로 회원가입 시 409', async () => {
    await seedDefaultCharacter(prisma);
    await seedUser(prisma, { deviceId: 'duplicate-device' });

    const response = await publicRequest(app)
      .post('/api/v2/auth/register')
      .send({
        deviceId: 'duplicate-device',
        nickname: '중복자',
        preferredThemeColor: '#000000',
      });

    expect(response.status).toBe(409);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'USER_ALREADY_EXISTS',
    );
  });

  // ─── TC-AUTH-005 ───

  it('TC-AUTH-005: 등록된 deviceId로 로그인 성공', async () => {
    await seedDefaultCharacter(prisma);
    await publicRequest(app).post('/api/v2/auth/register').send({
      deviceId: 'login-device-001',
      nickname: '로그인',
      preferredThemeColor: '#00FF00',
    });

    const response = await publicRequest(app)
      .post('/api/v2/auth/login')
      .send({ deviceId: 'login-device-001' });

    expect(response.status).toBe(200);
    const body = response.body as AuthResponse;
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  // ─── TC-AUTH-006 ───

  it('TC-AUTH-006: 미등록 deviceId로 로그인 시 401', async () => {
    const response = await publicRequest(app)
      .post('/api/v2/auth/login')
      .send({ deviceId: 'unknown-device-999' });

    expect(response.status).toBe(401);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'AUTHENTICATION_FAILED',
    );
  });

  // ─── TC-AUTH-007 ───

  it('TC-AUTH-007: 인증된 사용자 프로필 조회 성공', async () => {
    const accessToken = await registerAndGetToken('profile-device', '프로필');

    const response = await authRequest(app, accessToken).get(
      '/api/v1/users/me',
    );

    expect(response.status).toBe(200);
    const body = response.body as UserProfileResponse;
    expect(body.id).toBeDefined();
    expect(body.nickname).toBe('프로필');
    expect(body.nameTag).toBeDefined();
    expect(body.preferredThemeColor).toBe('#FF0000');
    expect(body.characterCode).toBe('default_char');
    expect(body.level).toBe(1);
    expect(body.experience).toBe(0);
  });

  // ─── TC-AUTH-008 ───

  it('TC-AUTH-008: 보유 캐릭터로 변경 성공', async () => {
    const accessToken = await registerAndGetToken('char-change-device', '캐변');
    const extraChar = await seedExtraCharacter(prisma);

    const profile = await authRequest(app, accessToken).get('/api/v1/users/me');
    const userId = (profile.body as UserProfileResponse).id;
    await grantCharacterToUser(prisma, userId, extraChar.id);

    const response = await authRequest(app, accessToken)
      .patch('/api/v1/users/character')
      .send({ characterCode: 'extra_char' });

    expect(response.status).toBe(200);
    expect((response.body as UserProfileResponse).characterCode).toBe(
      'extra_char',
    );
  });

  // ─── TC-AUTH-009 ───

  it('TC-AUTH-009: 미보유 캐릭터로 변경 시 400', async () => {
    const accessToken = await registerAndGetToken('no-char-device', '미보유');

    const response = await authRequest(app, accessToken)
      .patch('/api/v1/users/character')
      .send({ characterCode: 'not-owned-character' });

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'CHARACTER_NOT_OWNED',
    );
  });
});
