import { INestApplication } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const request: typeof import('supertest') = require('supertest');

type Server = import('http').Server;

const API_KEY = process.env.APP_API_KEY || 'test-api-key';

/**
 * V2 Public API 요청 (X-API-Key 자동 포함)
 */
export function publicRequest(app: INestApplication) {
  const server = app.getHttpServer() as Server;
  return {
    get: (url: string) => request(server).get(url).set('X-API-Key', API_KEY),
    post: (url: string) => request(server).post(url).set('X-API-Key', API_KEY),
  };
}

/**
 * 인증된 사용자 API 요청 (Authorization 자동 포함)
 */
export function authRequest(app: INestApplication, accessToken: string) {
  const server = app.getHttpServer() as Server;
  const auth = `Bearer ${accessToken}`;
  return {
    get: (url: string) => request(server).get(url).set('Authorization', auth),
    post: (url: string) => request(server).post(url).set('Authorization', auth),
    patch: (url: string) =>
      request(server).patch(url).set('Authorization', auth),
    delete: (url: string) =>
      request(server).delete(url).set('Authorization', auth),
  };
}
