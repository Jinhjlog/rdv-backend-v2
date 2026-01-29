import { Injectable, Logger } from '@nestjs/common';
import { DeviceTokenRepository } from '../../domain/repositories';

/**
 * 만료 토큰 정리 UseCase
 *
 * 일정 기간 미사용 토큰을 일괄 삭제합니다.
 * 스케줄러에서 주기적으로 호출됩니다.
 */
@Injectable()
export class CleanupStaleTokensUseCase {
  private readonly logger = new Logger(CleanupStaleTokensUseCase.name);

  /** 기본 만료 기간: 30일 */
  private readonly DEFAULT_STALE_DAYS = 30;

  constructor(private readonly deviceTokenRepository: DeviceTokenRepository) {}

  /**
   * 만료 토큰 정리 실행
   *
   * @param staleDays 만료 기준 일수 (기본값: 30일)
   * @returns 삭제된 토큰 수
   */
  async execute(staleDays?: number): Promise<number> {
    const days = staleDays ?? this.DEFAULT_STALE_DAYS;
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - days);

    const deletedCount =
      await this.deviceTokenRepository.deleteStaleTokens(staleDate);

    this.logger.log(
      `만료 토큰 정리 완료: ${deletedCount}개 삭제 (기준: ${days}일 미사용)`,
    );

    return deletedCount;
  }
}
