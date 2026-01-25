import { Injectable } from '@nestjs/common';
import { CursorUtil } from '@shared/utils';
import { DomainRuleViolationException } from '@shared/exception';
import { GroupRepository } from '../../domain/repositories';
import { ChatMessageQueryRepository } from '../../domain/repositories/chat-message-query.repository';
import { ChatMessageQueryModel } from '../../domain/models/chat-message/chat-message.query-model';
import { GetChatMessageListDto } from '../dtos/get-chat-message-list.dto';

/**
 * 메시지 히스토리 조회 UseCase
 *
 * 1. 그룹 참여자 검증
 * 2. 커서 디코딩
 * 3. limit + 1로 조회하여 다음 페이지 존재 여부 확인
 * 4. 다음 커서 생성
 */
@Injectable()
export class GetChatMessageListUseCase {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly chatMessageQueryRepository: ChatMessageQueryRepository,
  ) {}

  async execute(dto: GetChatMessageListDto): Promise<{
    items: ChatMessageQueryModel[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    // 1. 그룹 조회 및 참여자 검증
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group || !group.hasMember(dto.userId)) {
      throw new DomainRuleViolationException({
        entityName: 'GroupMember',
        errorCode: 'NOT_GROUP_MEMBER',
        reason: '모임 참여자만 메시지를 조회할 수 있습니다',
      });
    }

    // 2. 커서 디코딩
    let decodedCursor: { id: string; createdAt: string } | undefined =
      undefined;

    if (dto.cursor) {
      decodedCursor = CursorUtil.decode(dto.cursor);
    }

    // 3. limit + 1로 조회하여 다음 페이지 존재 여부 확인
    const messages = await this.chatMessageQueryRepository.findList({
      groupId: dto.groupId,
      cursor: decodedCursor,
      sinceId: dto.sinceId,
      limit: dto.limit + 1,
    });

    // 4. 다음 페이지 존재 여부 판단
    const hasMore = messages.length > dto.limit;
    const items = hasMore ? messages.slice(0, dto.limit) : messages;

    // 5. 다음 커서 생성
    const nextCursor =
      hasMore && items.length > 0
        ? CursorUtil.encode({
            id: items[items.length - 1].id,
            createdAt: items[items.length - 1].createdAt,
          })
        : undefined;

    return { items, nextCursor, hasMore };
  }
}
