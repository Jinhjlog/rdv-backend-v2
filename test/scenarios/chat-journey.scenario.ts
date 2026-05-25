/**
 * SCN-002: 모임 → 채팅 여정
 *
 * 배우:     모임장(owner), 멤버(member)
 * 전제:     디폴트 캐릭터 시드
 * 성공 조건: 모임 생성 → 멤버 참여 → SSE 연결 → 메시지 전송 → 브로드캐스트 수신 → 히스토리 조회
 *
 * Step 1  모임장 가입 + 모임 생성
 * Step 2  멤버 가입 + 초대코드로 모임 참여
 * Step 3  모임장 SSE 연결
 * Step 4  멤버가 메시지 전송 → 모임장 SSE로 수신 확인
 * Step 5  메시지 히스토리 조회 (커서 기반 페이지네이션)
 */

import * as http from 'http';
import * as net from 'net';
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
} from '../helpers/e2e.helper';
import { seedDefaultCharacter } from '../helpers/seed';

const MESSAGE_CONTENT = '시나리오 테스트 메시지';

interface SSEConnection {
  req: http.ClientRequest;
  messages: string[];
  connected: Promise<void>;
}

function connectSSE(port: number, path: string, token: string): SSEConnection {
  const messages: string[] = [];
  let resolveConnected: () => void;
  const connected = new Promise<void>((r) => (resolveConnected = r));

  const req = http.get(
    `http://localhost:${port}${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
    },
    (res) => {
      resolveConnected();
      res.on('data', (chunk: Buffer) => {
        const text = new TextDecoder('utf-8').decode(chunk);
        messages.push(text);
      });
    },
  );

  req.on('error', () => {});

  return { req, messages, connected };
}

describe('SCN-002: 모임 → 채팅 여정', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let port: number;
  const activeConnections: http.ClientRequest[] = [];

  let ownerToken: string;
  let memberToken: string;
  let groupId: string;
  let ownerSse: SSEConnection;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await cleanDatabase(prisma);
    await seedDefaultCharacter(prisma);
    await app.listen(0);
    const server = app.getHttpServer() as http.Server;
    port = (server.address() as net.AddressInfo).port;
  });

  afterAll(async () => {
    activeConnections.forEach((req) => req.destroy());
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    await cleanDatabase(prisma);
    if (app) await app.close();
  });

  // ── Step 1 ──

  it('Step 1: 모임장 가입 및 모임 생성', async () => {
    ownerToken = await registerUser(app, 'scn-002-owner', '모임장');
    await new Promise((r) => setTimeout(r, 500));

    const group = await createGroup(app, ownerToken);
    groupId = group.id;

    expect(groupId).toBeDefined();
  });

  // ── Step 2 ──

  it('Step 2: 멤버 가입 및 초대코드로 모임 참여', async () => {
    expect(groupId).toBeDefined();

    memberToken = await registerUser(app, 'scn-002-member', '멤버');
    await new Promise((r) => setTimeout(r, 500));

    await inviteAndJoin(app, ownerToken, memberToken, groupId);
  });

  // ── Step 3 ──

  it('Step 3: 모임장 SSE 연결', async () => {
    expect(groupId).toBeDefined();

    ownerSse = connectSSE(
      port,
      `/api/v1/groups/${groupId}/short-talk/stream`,
      ownerToken,
    );
    activeConnections.push(ownerSse.req);
    await ownerSse.connected;

    await new Promise((r) => setTimeout(r, 500));
  });

  // ── Step 4 ──

  it('Step 4: 멤버가 메시지 전송 → 모임장 SSE로 수신 확인', async () => {
    expect(groupId).toBeDefined();
    expect(ownerSse).toBeDefined();

    const sendRes = await authRequest(app, memberToken)
      .post(`/api/v1/groups/${groupId}/short-talk/messages`)
      .send({ content: MESSAGE_CONTENT });

    expect(sendRes.status).toBe(201);
    expect((sendRes.body as { id: string }).id).toBeDefined();

    await new Promise((r) => setTimeout(r, 500));

    const hasMessage = ownerSse.messages.some((msg) =>
      msg.includes(MESSAGE_CONTENT),
    );
    expect(hasMessage).toBe(true);
  });

  // ── Step 5 ──

  it('Step 5: 메시지 히스토리 조회', async () => {
    expect(groupId).toBeDefined();

    const res = await authRequest(app, memberToken).get(
      `/api/v1/groups/${groupId}/short-talk/messages`,
    );

    expect(res.status).toBe(200);

    const body = res.body as {
      items: Array<{ content: string; sender: { nickname: string } }>;
      nextCursor: string | null;
      hasMore: boolean;
    };

    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items[0].content).toBe(MESSAGE_CONTENT);
    expect(body.hasMore).toBe(false);
  });
});
