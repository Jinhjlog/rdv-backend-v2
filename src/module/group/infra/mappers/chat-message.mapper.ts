import { chat_messages as ChatMessagePrisma } from '@prisma/client';
import { ChatMessage } from '../../domain/models/chat-message/chat-message';

/**
 * ChatMessageMapper
 *
 * ChatMessage 엔티티와 Prisma 모델 간의 매핑
 */
export class ChatMessageMapper {
  /**
   * Prisma 모델을 도메인 엔티티로 변환합니다
   */
  static toDomain(prismaMessage: ChatMessagePrisma): ChatMessage {
    return ChatMessage.unsafeCreate({
      id: prismaMessage.id,
      groupId: prismaMessage.group_id,
      senderId: prismaMessage.sender_id,
      content: prismaMessage.content,
      createdAt: prismaMessage.created_at,
    });
  }

  /**
   * 도메인 엔티티를 Prisma 생성 데이터로 변환합니다
   */
  static toPersistence(message: ChatMessage): {
    id: string;
    group_id: string;
    sender_id: string;
    content: string;
    created_at: Date;
  } {
    return {
      id: message.id.toString(),
      group_id: message.groupId,
      sender_id: message.senderId,
      content: message.content,
      created_at: message.createdAt,
    };
  }
}
