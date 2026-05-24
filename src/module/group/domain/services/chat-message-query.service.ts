import { FindManyParams } from '@shared/utils';
import { ChatMessageReadModel } from '../models';

export interface FindChatMessageListParams extends FindManyParams {
  groupId: string;
  sinceId?: string;
}

/** 채팅 메시지 조회용 QueryService */
export abstract class ChatMessageQueryService {
  /** 그룹의 메시지 목록을 조회합니다 (커서 기반 페이지네이션). */
  abstract findList(
    params: FindChatMessageListParams,
  ): Promise<ChatMessageReadModel[]>;
}
