import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';
import { TokenValidationPort } from '../../application/ports';

/**
 * FCM 기반 토큰 유효성 검증 Adapter
 *
 * Firebase Admin SDK의 dry-run send를 통해 토큰 유효성을 검증합니다.
 */
@Injectable()
export class FcmTokenValidationAdapter implements TokenValidationPort {
  private readonly logger = new Logger(FcmTokenValidationAdapter.name);

  async validateToken(token: string): Promise<boolean> {
    try {
      if (!token || token.trim().length === 0) {
        return false;
      }

      await admin.messaging().send(
        {
          token,
          notification: {
            title: 'Test',
            body: 'Test',
          },
        },
        true,
      );

      return true;
    } catch (error) {
      this.logger.debug(
        `FCM 토큰 검증 실패: ${token.slice(0, 20)}..., 오류: ${error}`,
      );
      return false;
    }
  }
}
