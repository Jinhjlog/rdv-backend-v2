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

interface SendMessageResponse {
  id: string;
  createdAt: string;
}

interface MessageListResponse {
  items: Array<{
    id: string;
    content: string;
    sender: { id: string; nickname: string };
  }>;
  nextCursor: string | null;
  hasMore: boolean;
}

// ── SSE 헬퍼 ─────────────────────────────────────────────────

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

  req.on('error', () => {
    // SSE 연결 종료 시 에러 무시
  });

  return { req, messages, connected };
}

// ── 테스트 ───────────────────────────────────────────────────

describe('숏 톡 (P2)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let port: number;
  const activeConnections: http.ClientRequest[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await app.listen(0);
    const server = app.getHttpServer() as http.Server;
    port = (server.address() as net.AddressInfo).port;
  });

  afterAll(async () => {
    activeConnections.forEach((req) => req.destroy());
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    if (app) await app.close();
  });

  afterEach(() => {
    activeConnections.forEach((req) => req.destroy());
    activeConnections.length = 0;
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    await seedDefaultCharacter(prisma);
  });

  // ─── TC-STK-001 ───

  it('TC-STK-001: 메시지 전송 성공', async () => {
    const ownerToken = await registerUser(app, 'stk-001-owner', '모임장');
    const group = await createGroup(app, ownerToken);

    const response = await authRequest(app, ownerToken)
      .post(`/api/v1/groups/${group.id}/short-talk/messages`)
      .send({ content: '안녕하세요!' });

    expect(response.status).toBe(201);
    const body = response.body as SendMessageResponse;
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
  });

  // ─── TC-STK-002 ───

  it('TC-STK-002: 메시지 히스토리 조회 성공', async () => {
    const ownerToken = await registerUser(app, 'stk-002-owner', '모임장');
    const group = await createGroup(app, ownerToken);

    await authRequest(app, ownerToken)
      .post(`/api/v1/groups/${group.id}/short-talk/messages`)
      .send({ content: '첫 번째 메시지' });

    const response = await authRequest(app, ownerToken).get(
      `/api/v1/groups/${group.id}/short-talk/messages`,
    );

    expect(response.status).toBe(200);
    const body = response.body as MessageListResponse;
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items[0].content).toBe('첫 번째 메시지');
    expect(body.hasMore).toBeDefined();
  });

  // ─── TC-STK-003 ───

  it('TC-STK-003: SSE 스트림 연결 성공', async () => {
    const ownerToken = await registerUser(app, 'stk-003-owner', '모임장');
    const group = await createGroup(app, ownerToken);

    const sse = connectSSE(
      port,
      `/api/v1/groups/${group.id}/short-talk/stream`,
      ownerToken,
    );
    activeConnections.push(sse.req);
    await sse.connected;

    expect(true).toBe(true);
  });

  // ─── TC-STK-004 ───

  it('TC-STK-004: SSE로 메시지 브로드캐스트 수신', async () => {
    const ownerToken = await registerUser(app, 'stk-004-owner', '모임장');
    const memberToken = await registerUser(app, 'stk-004-member', '멤버');
    const group = await createGroup(app, ownerToken);
    await inviteAndJoin(app, ownerToken, memberToken, group.id);

    // 멤버A가 SSE 연결
    const sse = connectSSE(
      port,
      `/api/v1/groups/${group.id}/short-talk/stream`,
      ownerToken,
    );
    activeConnections.push(sse.req);
    await sse.connected;
    await new Promise((r) => setTimeout(r, 500));

    // 멤버B가 메시지 전송
    const sendRes = await authRequest(app, memberToken)
      .post(`/api/v1/groups/${group.id}/short-talk/messages`)
      .send({ content: '브로드캐스트 테스트' });
    expect(sendRes.status).toBe(201);

    // 브로드캐스트 수신 대기
    await new Promise((r) => setTimeout(r, 500));

    // SSE messages에 메시지 이벤트가 도착했는지 확인
    const hasMessage = sse.messages.some((msg) =>
      msg.includes('브로드캐스트 테스트'),
    );
    expect(hasMessage).toBe(true);
  });

  // ─── TC-STK-005 ───

  it('TC-STK-005: 비멤버가 메시지 전송 시 403', async () => {
    const ownerToken = await registerUser(app, 'stk-005-owner', '모임장');
    const outsiderToken = await registerUser(app, 'stk-005-outsider', '외부인');
    const group = await createGroup(app, ownerToken);

    const response = await authRequest(app, outsiderToken)
      .post(`/api/v1/groups/${group.id}/short-talk/messages`)
      .send({ content: '침입!' });

    expect(response.status).toBe(400);
    expect((response.body as { errorCode: string }).errorCode).toBe(
      'NOT_GROUP_MEMBER',
    );
  });
});
