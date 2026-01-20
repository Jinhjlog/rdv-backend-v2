import { FindManyParams } from '@shared/utils';
import { ChatMessageQueryModel } from '../models/chat-message/chat-message.query-model';

/**
 * 메시지 목록 조회 파라미터
 */
export interface FindChatMessageListParams extends FindManyParams {
  groupId: string;
}

/**
 * ChatMessage 조회용 Repository
 *
 * 복잡한 조회 쿼리를 처리합니다.
 */
export abstract class ChatMessageQueryRepository {
  /**
   * 그룹의 메시지 목록 조회 (커서 기반 페이지네이션)
   */
  abstract findList(
    params: FindChatMessageListParams,
  ): Promise<ChatMessageQueryModel[]>;
}
