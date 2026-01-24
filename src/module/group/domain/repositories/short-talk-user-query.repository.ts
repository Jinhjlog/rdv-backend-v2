import { ShortTalkSenderInfo } from '../models/short-talk/short-talk-event';

/**
 * Short Talk 사용자 조회 Repository
 *
 * SSE 연결 시 발신자 정보 조회를 위한 Repository
 */
export abstract class ShortTalkUserQueryRepository {
  abstract findSenderInfoById(
    userId: string,
  ): Promise<ShortTalkSenderInfo | undefined>;
}
