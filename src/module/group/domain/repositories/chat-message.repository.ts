import { ChatMessage } from '../models/chat-message/chat-message';

/**
 * ChatMessage Repository 인터페이스
 */
export abstract class ChatMessageRepository {
  /**
   * 메시지 저장
   */
  abstract save(chatMessage: ChatMessage): Promise<void>;

  /**
   * 그룹의 메시지 목록 조회 (커서 기반 페이지네이션)
   * @param groupId 그룹 ID
   * @param cursor 마지막 조회 메시지 ID (선택)
   * @param limit 조회 개수
   */
  abstract findByGroupId(
    groupId: string,
    cursor?: string,
    limit?: number,
  ): Promise<ChatMessage[]>;

  /**
   * 메시지 ID로 조회
   */
  abstract findById(id: string): Promise<ChatMessage | undefined>;
}
