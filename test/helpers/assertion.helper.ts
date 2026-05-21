import type { Response } from 'supertest';

export interface ErrorResponseBody {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
}

/**
 * E2E 에러 응답을 검증합니다.
 */
export function expectError(
  response: Response,
  expected: {
    statusCode: number;
    errorCode: string;
    message?: string;
  },
): void {
  const body = response.body as ErrorResponseBody;

  expect(response.status).toBe(expected.statusCode);
  expect(body.errorCode).toBe(expected.errorCode);

  if (expected.message) {
    expect(body.message).toBe(expected.message);
  }
}

/**
 * 성공 응답의 상태 코드를 검증하고 타입이 지정된 body를 반환합니다.
 */
export function expectSuccess<T>(response: Response, statusCode: number): T {
  expect(response.status).toBe(statusCode);
  return response.body as T;
}
