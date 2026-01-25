import { FindManyParams } from '@shared/utils';
import { ChatMessageQueryModel } from '../models/chat-message/chat-message.query-model';

/**
 * 메시지 목록 조회 파라미터
 */
export interface FindChatMessageListParams extends FindManyParams {
  groupId: string;
  /**
   * 이 메시지 ID 이후에 생성된 메시지만 조회
   * (백그라운드 복귀 시 놓친 메시지 동기화용)
   */
  sinceId?: string;
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
