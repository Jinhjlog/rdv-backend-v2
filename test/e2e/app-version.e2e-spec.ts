import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { adminRequest, unauthenticatedRequest } from '../helpers/api.helper';

interface AppVersionResponse {
  latestVersion: string;
  minRequiredVersion: string;
  storeUrl: string;
}

describe('앱 버전 (P3)', () => {
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

  async function seedAppVersion(platform: string) {
    await adminRequest(app).put('/api/v1/admin/app-versions').send({
      platform,
      latestVersion: '2.0.0',
      minRequiredVersion: '1.5.0',
      storeUrl: 'https://play.google.com/store/apps/details?id=com.eodigae.app',
    });
  }

  // ─── TC-VER-001 ───

  it('TC-VER-001: 등록된 플랫폼의 앱 버전 조회 성공', async () => {
    await seedAppVersion('ANDROID');

    const response = await unauthenticatedRequest(app)
      .get('/api/v1/app-versions')
      .query({ platform: 'ANDROID' });

    expect(response.status).toBe(200);
    const body = response.body as AppVersionResponse;
    expect(body.latestVersion).toBe('2.0.0');
    expect(body.minRequiredVersion).toBe('1.5.0');
    expect(body.storeUrl).toBe(
      'https://play.google.com/store/apps/details?id=com.eodigae.app',
    );
  });

  // ─── TC-VER-002 ───

  it('TC-VER-002: 미등록 플랫폼 조회 시 404', async () => {
    const response = await unauthenticatedRequest(app)
      .get('/api/v1/app-versions')
      .query({ platform: 'IOS' });

    expect(response.status).toBe(404);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'APP_VERSION_NOT_FOUND',
    );
  });

  // ─── TC-VER-003 ───

  it('TC-VER-003: 관리자 앱 버전 등록/수정 성공', async () => {
    const response = await adminRequest(app)
      .put('/api/v1/admin/app-versions')
      .send({
        platform: 'ANDROID',
        latestVersion: '3.0.0',
        minRequiredVersion: '2.0.0',
        storeUrl:
          'https://play.google.com/store/apps/details?id=com.eodigae.app',
      });

    expect(response.status).toBe(204);

    const getResponse = await unauthenticatedRequest(app)
      .get('/api/v1/app-versions')
      .query({ platform: 'ANDROID' });

    expect(getResponse.status).toBe(200);
    const body = getResponse.body as AppVersionResponse;
    expect(body.latestVersion).toBe('3.0.0');
    expect(body.minRequiredVersion).toBe('2.0.0');
  });

  // ─── TC-VER-004 ───

  it('TC-VER-004: API Key 없이 관리자 API 호출 시 401', async () => {
    const response = await unauthenticatedRequest(app)
      .put('/api/v1/admin/app-versions')
      .send({
        platform: 'ANDROID',
        latestVersion: '2.0.0',
        minRequiredVersion: '1.5.0',
        storeUrl:
          'https://play.google.com/store/apps/details?id=com.eodigae.app',
      });

    expect(response.status).toBe(401);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'INVALID_API_KEY',
    );
  });
});
