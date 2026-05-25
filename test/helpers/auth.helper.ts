import * as jwt from 'jsonwebtoken';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';

/**
 * 테스트용 JWT 토큰을 생성합니다.
 */
export function createTestToken(userId: string): string {
  return jwt.sign({ userId }, TEST_JWT_SECRET, { expiresIn: '1h' });
}
