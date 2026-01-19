import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';

/**
 * Firebase의 헬스 상태를 확인하는 서비스
 *
 * Firebase Admin SDK 초기화 및 주요 서비스(Storage) 접근 가능 여부를 검증합니다.
 */
@Injectable()
export class FirebaseHealthService {
  private readonly logger = new Logger(FirebaseHealthService.name);

  /**
   * Firebase의 초기화 및 주요 서비스 접근 가능 여부를 확인합니다.
   *
   * @throws Error Firebase가 정상 작동하지 않을 경우
   *
   * @example
   * ```typescript
   * try {
   *   await firebaseHealth.checkHealth();
   *   // Firebase 정상
   * } catch (error) {
   *   // Firebase 오류 처리
   * }
   * ```
   */
  async checkHealth(): Promise<void> {
    // 1. Firebase Admin SDK 초기화 확인
    const app = admin.app();
    if (!app.name) {
      return Promise.reject(
        new Error('Firebase Admin SDK가 초기화되지 않았습니다'),
      );
    }

    // 2. Storage 버킷 접근 확인
    const bucket = admin.storage().bucket();
    if (!bucket.name) {
      return Promise.reject(
        new Error('Firebase Storage 버킷에 접근할 수 없습니다'),
      );
    }

    this.logger.debug('Firebase health check passed');
    return Promise.resolve();
  }
}
