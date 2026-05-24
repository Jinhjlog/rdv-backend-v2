import { INestApplication } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const request: typeof import('supertest') = require('supertest');

type Server = import('http').Server;

const API_KEY = process.env.APP_API_KEY || 'test-api-key';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'test-admin-api-key';

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
 * 관리자 API 요청 (x-api-key 헤더에 ADMIN_API_KEY 자동 포함)
 */
export function adminRequest(app: INestApplication) {
  const server = app.getHttpServer() as Server;
  return {
    get: (url: string) =>
      request(server).get(url).set('x-api-key', ADMIN_API_KEY),
    post: (url: string) =>
      request(server).post(url).set('x-api-key', ADMIN_API_KEY),
    put: (url: string) =>
      request(server).put(url).set('x-api-key', ADMIN_API_KEY),
    patch: (url: string) =>
      request(server).patch(url).set('x-api-key', ADMIN_API_KEY),
    delete: (url: string) =>
      request(server).delete(url).set('x-api-key', ADMIN_API_KEY),
  };
}

/**
 * 인증 없이 API 요청 (헤더 없음)
 */
export function unauthenticatedRequest(app: INestApplication) {
  const server = app.getHttpServer() as Server;
  return {
    get: (url: string) => request(server).get(url),
    post: (url: string) => request(server).post(url),
    put: (url: string) => request(server).put(url),
    patch: (url: string) => request(server).patch(url),
    delete: (url: string) => request(server).delete(url),
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
