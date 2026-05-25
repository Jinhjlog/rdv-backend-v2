import { Injectable, Logger } from '@nestjs/common';
import { ChatMessageRepository } from '../../domain/repositories';
import {
  GroupMembershipLookupService,
  ShortTalkUserQueryService,
} from '../../domain/services';
import { ChatMessage } from '../../domain/models/chat-message/chat-message';
import { SseConnectionPort } from '../ports';
import {
  SendShortTalkMessageDto,
  SendShortTalkMessageResultDto,
} from '../dtos/send-short-talk-message.dto';
import { DomainRuleViolationException } from '@shared/exception';
import { ProfanityFilterService } from '@core/profanity/profanity-filter.service';

/**
 * Short Talk 메시지 전송 UseCase
 *
 * 1. 그룹 멤버십 검증
 * 2. 메시지 내용 유효성 검증
 * 3. 욕설 마스킹 처리
 * 4. DB에 메시지 저장
 * 5. SSE로 브로드캐스트 (Port 위임)
 */
@Injectable()
export class SendShortTalkMessageUseCase {
  private readonly logger = new Logger(SendShortTalkMessageUseCase.name);

  constructor(
    private readonly groupMembershipLookupService: GroupMembershipLookupService,
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly shortTalkUserQueryService: ShortTalkUserQueryService,
    private readonly sseConnectionPort: SseConnectionPort,
    private readonly profanityFilter: ProfanityFilterService,
  ) {}

  async execute(
    dto: SendShortTalkMessageDto,
  ): Promise<SendShortTalkMessageResultDto> {
    // 1. 그룹 멤버십 검증
    const isMember = await this.groupMembershipLookupService.isMember(
      dto.groupId,
      dto.senderId,
    );
    if (!isMember) {
      throw new DomainRuleViolationException({
        entityName: 'GroupMember',
        errorCode: 'NOT_GROUP_MEMBER',
        reason: '모임 참여자만 메시지를 보낼 수 있습니다',
      });
    }

    // 2. 메시지 내용 유효성 검증
    const validation = ChatMessage.validateContent(dto.content);
    if (!validation.isValid) {
      throw new DomainRuleViolationException({
        entityName: 'ChatMessage',
        errorCode: validation.errorCode!,
        reason: validation.reason!,
      });
    }

    // 3. 욕설 마스킹 처리
    const maskResult = this.profanityFilter.maskProfanity(dto.content);
    const sanitizedContent = maskResult.maskedText;

    // 4. ChatMessage 생성 및 저장
    const chatMessage = ChatMessage.create({
      groupId: dto.groupId,
      senderId: dto.senderId,
      content: sanitizedContent,
    });

    await this.chatMessageRepository.save(chatMessage);

    this.logger.log(
      `메시지 전송: groupId=${dto.groupId}, senderId=${dto.senderId}, messageId=${chatMessage.id.toString()}`,
    );

    // 5. SSE 브로드캐스트
    const senderInfo =
      this.sseConnectionPort.getSenderInfo(dto.groupId, dto.senderId) ??
      (await this.shortTalkUserQueryService.findSenderInfoById(dto.senderId));

    if (senderInfo) {
      this.sseConnectionPort.publish(dto.groupId, {
        type: 'message',
        id: chatMessage.id.toString(),
        groupId: chatMessage.groupId,
        senderId: chatMessage.senderId,
        content: chatMessage.content,
        createdAt: chatMessage.createdAt.toISOString(),
        timestamp: new Date().toISOString(),
        sender: senderInfo,
      });
    }

    return {
      id: chatMessage.id.toString(),
      groupId: chatMessage.groupId,
      senderId: chatMessage.senderId,
      content: chatMessage.content,
      createdAt: chatMessage.createdAt,
    };
  }
}
