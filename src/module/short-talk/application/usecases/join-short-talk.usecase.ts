import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  ShortTalkUserQueryService,
  GroupMembershipLookupService,
} from '../../domain/services';
import { SseMessageEvent } from '../ports';
import { SseConnectionPort } from '../ports';
import { JoinShortTalkDto } from '../dtos';
import { DomainRuleViolationException } from '@shared/exception';

/**
 * Short Talk 참여 (SSE 연결) UseCase
 *
 * 1. 그룹 멤버십 검증
 * 2. 사용자 정보 조회
 * 3. SSE 연결 생성 (Port 위임)
 */
@Injectable()
export class JoinShortTalkUseCase {
  constructor(
    private readonly groupMembershipLookupService: GroupMembershipLookupService,
    private readonly shortTalkUserQueryService: ShortTalkUserQueryService,
    private readonly sseConnectionPort: SseConnectionPort,
  ) {}

  async execute(dto: JoinShortTalkDto): Promise<Observable<SseMessageEvent>> {
    // 1. 그룹 멤버십 검증
    const isMember = await this.groupMembershipLookupService.isMember(
      dto.groupId,
      dto.userId,
    );
    if (!isMember) {
      throw new DomainRuleViolationException({
        entityName: 'GroupMember',
        errorCode: 'NOT_GROUP_MEMBER',
        reason: '모임 참여자만 채팅에 참여할 수 있습니다',
      });
    }

    // 2. 사용자 정보 조회
    const senderInfo = await this.shortTalkUserQueryService.findSenderInfoById(
      dto.userId,
    );
    if (!senderInfo) {
      throw new DomainRuleViolationException({
        entityName: 'User',
        errorCode: 'USER_NOT_FOUND',
        reason: '사용자 정보를 찾을 수 없습니다',
      });
    }

    // 3. SSE 연결 생성 (Subject, Heartbeat, 재연결 처리는 Adapter가 담당)
    return this.sseConnectionPort.subscribe(
      dto.groupId,
      dto.userId,
      senderInfo,
    );
  }
}
