import { ChatCountResolver } from './chat-count.resolver';

export { ChatCountResolver };

/**
 * 모든 언락 조건 리졸버 목록
 *
 * 새 리졸버 추가 시 이 배열에만 추가하면 됩니다.
 */
export const UNLOCK_CONDITION_RESOLVER_CLASSES = [ChatCountResolver];
