import { Injectable } from '@nestjs/common';
import { TokenValidationPort } from '../../application/ports';

/**
 * 토큰 유효성 검증 Mock Adapter
 *
 * 모든 토큰을 유효한 것으로 처리합니다.
 * E2E 테스트 환경에서 Firebase 연결 없이 동작합니다.
 */
@Injectable()
export class MockTokenValidationAdapter implements TokenValidationPort {
  validateToken(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
