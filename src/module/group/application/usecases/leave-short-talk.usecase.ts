import { Injectable, Logger } from '@nestjs/common';
import { ShortTalkSessionRepository } from '../../domain/repositories';
import { LeaveShortTalkDto } from '../dtos';

/**
 * Short Talk 퇴장 (SSE 연결 해제) UseCase
 *
 * 1. 세션에서 리스너 제거
 * 2. 리스너 0명 시 세션 자동 삭제
 */
@Injectable()
export class LeaveShortTalkUseCase {
  private readonly logger = new Logger(LeaveShortTalkUseCase.name);

  constructor(
    private readonly shortTalkSessionRepository: ShortTalkSessionRepository,
  ) {}

  execute(dto: LeaveShortTalkDto): void {
    const session = this.shortTalkSessionRepository.findById(dto.groupId);

    if (!session) {
      // 세션이 없으면 무시 (이미 정리됨)
      return;
    }

    const listener = session.getListener(dto.userId);
    if (!listener) {
      // 리스너가 없으면 무시
      return;
    }

    this.logger.debug(
      `SSE 연결 해제: groupId=${dto.groupId}, userId=${dto.userId}`,
    );

    // 리스너 제거 (리스너 0명 시 세션 자동 삭제)
    this.shortTalkSessionRepository.removeListener(dto.groupId, dto.userId);
  }
}
