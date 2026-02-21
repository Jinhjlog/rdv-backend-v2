import { Injectable, Logger } from '@nestjs/common';
import { PushTokenRepository } from '../../domain/repositories';

/**
 * 실패한 토큰 처리 UseCase
 *
 * FCM 발송 실패 토큰을 일괄 삭제합니다.
 * 알림 발송 후 콜백으로 호출됩니다.
 */
@Injectable()
export class HandleFailedTokensUseCase {
  private readonly logger = new Logger(HandleFailedTokensUseCase.name);

  constructor(private readonly pushTokenRepository: PushTokenRepository) {}

  /**
   * 실패한 토큰 처리 실행
   *
   * @param failedTokens 발송 실패한 FCM 토큰 배열
   */
  async execute(failedTokens: string[]): Promise<void> {
    if (failedTokens.length === 0) {
      return;
    }

    await this.pushTokenRepository.deleteByTokens(failedTokens);
    this.logger.log(`무효 토큰 삭제 완료: ${failedTokens.length}개`);
  }
}
