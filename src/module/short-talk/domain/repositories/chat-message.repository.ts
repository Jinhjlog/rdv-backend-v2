import { ChatMessage } from '../models/chat-message/chat-message';

/**
 * ChatMessage Repository 인터페이스
 *
 * 메시지 저장 및 단건 조회를 처리합니다.
 * 목록 조회는 ChatMessageQueryService를 사용하세요.
 */
export abstract class ChatMessageRepository {
  /**
   * 메시지 저장
   */
  abstract save(chatMessage: ChatMessage): Promise<void>;

  /**
   * 메시지 ID로 조회
   */
  abstract findById(id: string): Promise<ChatMessage | undefined>;
}
