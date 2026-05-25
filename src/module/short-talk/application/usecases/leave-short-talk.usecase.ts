import { Injectable } from '@nestjs/common';
import { SseConnectionPort } from '../ports';
import { LeaveShortTalkDto } from '../dtos';

/**
 * Short Talk 퇴장 (SSE 연결 해제) UseCase
 */
@Injectable()
export class LeaveShortTalkUseCase {
  constructor(private readonly sseConnectionPort: SseConnectionPort) {}

  execute(dto: LeaveShortTalkDto): void {
    this.sseConnectionPort.disconnect(dto.groupId, dto.userId);
  }
}
