import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CleanupStaleTokensUseCase } from '../../application/usecases/cleanup-stale-tokens.usecase';

/**
 * 토큰 정리 스케줄러
 *
 * 매일 새벽 3시에 만료된 FCM 토큰을 정리합니다.
 */
@Injectable()
export class TokenCleanupScheduler {
  private readonly logger = new Logger(TokenCleanupScheduler.name);

  constructor(
    private readonly cleanupStaleTokensUseCase: CleanupStaleTokensUseCase,
  ) {}

  /**
   * 매일 새벽 3시(KST)에 실행
   * 30일 이상 미사용 토큰을 삭제합니다.
   */
  @Cron('0 3 * * *', { timeZone: 'Asia/Seoul' })
  async handleStaleTokenCleanup(): Promise<void> {
    this.logger.log('만료 토큰 정리 작업 시작...');

    try {
      const deletedCount = await this.cleanupStaleTokensUseCase.execute();
      this.logger.log(`만료 토큰 정리 작업 완료: ${deletedCount}개 삭제`);
    } catch (error) {
      this.logger.error(`만료 토큰 정리 작업 실패: ${error}`);
    }
  }
}
