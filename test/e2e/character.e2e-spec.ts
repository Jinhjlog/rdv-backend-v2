import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/module/core/database/prisma.service';
import { DomainEvents } from '../../src/lib/domain/events/domain-events';
import { createTestApp } from '../helpers/test-app.helper';
import { cleanDatabase } from '../helpers/db-cleanup.helper';
import { authRequest } from '../helpers/api.helper';
import { registerUser } from '../helpers/e2e.helper';
import { seedDefaultCharacter } from '../helpers/seed';

interface CharacterListResponse {
  characters: Array<{
    id: string;
    characterCode: string;
    name: string;
    isDefault: boolean;
    isOwned: boolean;
  }>;
}

interface UnlockConfigResponse {
  needsUnlockTracking: boolean;
  trackableEventTypes: string[];
}

interface TrackUnlockResponse {
  unlockedCharacters: Array<{
    characterCode: string;
    name: string;
    description: string;
  }>;
}

describe('캐릭터 (P2)', () => {
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

  async function seedUnlockableCharacter() {
    return prisma.characters.create({
      data: {
        character_code: 'unlock_menu_char',
        name: '메뉴 캐릭터',
        description: '메뉴 접근 시 언락되는 캐릭터',
        is_default: false,
        unlock_condition: { eventType: 'MENU_ACCESSED' },
        updated_at: new Date(),
      },
    });
  }

  // ─── TC-CHR-001 ───

  it('TC-CHR-001: 캐릭터 목록 조회 (보유/미보유 구분)', async () => {
    // Given: 회원가입 먼저 → 이벤트 핸들러 완료 대기 → 그 후 언락 가능 캐릭터 시드
    // (회원가입 시 자동 전체 지급 대상에서 제외하기 위해)
    const token = await registerUser(app, 'chr-001');
    await new Promise((r) => setTimeout(r, 500));
    await seedUnlockableCharacter();

    const response = await authRequest(app, token).get('/api/v1/characters');

    expect(response.status).toBe(200);
    const body = response.body as CharacterListResponse;
    expect(body.characters.length).toBeGreaterThanOrEqual(2);

    const defaultChar = body.characters.find((c) => c.isDefault);
    expect(defaultChar?.isOwned).toBe(true);

    const unlockChar = body.characters.find(
      (c) => c.characterCode === 'unlock_menu_char',
    );
    expect(unlockChar?.isOwned).toBe(false);
  });

  // ─── TC-CHR-002 ───

  it('TC-CHR-002: 언락 트래킹 설정 조회', async () => {
    const token = await registerUser(app, 'chr-002');
    await new Promise((r) => setTimeout(r, 500));
    await seedUnlockableCharacter();

    const response = await authRequest(app, token).get(
      '/api/v1/characters/unlock-config',
    );

    expect(response.status).toBe(200);
    const body = response.body as UnlockConfigResponse;
    expect(body.needsUnlockTracking).toBe(true);
    expect(body.trackableEventTypes).toBeDefined();
    expect(body.trackableEventTypes.length).toBeGreaterThanOrEqual(1);
  });

  // ─── TC-CHR-003 ───

  it('TC-CHR-003: 언락 이벤트 처리 성공', async () => {
    const token = await registerUser(app, 'chr-003');
    await new Promise((r) => setTimeout(r, 500));
    await seedUnlockableCharacter();

    const response = await authRequest(app, token)
      .post('/api/v1/characters/unlock')
      .send({ eventType: 'MENU_ACCESSED', payload: {} });

    expect(response.status).toBe(200);
    const body = response.body as TrackUnlockResponse;
    expect(body.unlockedCharacters).toBeDefined();
    const unlocked = body.unlockedCharacters.find(
      (c) => c.characterCode === 'unlock_menu_char',
    );
    expect(unlocked).toBeDefined();
  });

  // ─── TC-CHR-004 ───

  it('TC-CHR-004: 이미 보유한 캐릭터 중복 언락 방지', async () => {
    const token = await registerUser(app, 'chr-004');
    await new Promise((r) => setTimeout(r, 500));
    await seedUnlockableCharacter();

    const firstRes = await authRequest(app, token)
      .post('/api/v1/characters/unlock')
      .send({ eventType: 'MENU_ACCESSED', payload: {} });
    expect(firstRes.status).toBe(200);
    expect(
      (firstRes.body as TrackUnlockResponse).unlockedCharacters.length,
    ).toBeGreaterThanOrEqual(1);

    const response = await authRequest(app, token)
      .post('/api/v1/characters/unlock')
      .send({ eventType: 'MENU_ACCESSED', payload: {} });

    expect(response.status).toBe(200);
    const body = response.body as TrackUnlockResponse;
    expect(body.unlockedCharacters).toHaveLength(0);
  });
});
