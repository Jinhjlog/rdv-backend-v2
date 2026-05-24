import { ShortTalkSenderInfo } from '../models/short-talk/short-talk-event';

/** Short Talk 사용자 조회 QueryService */
export abstract class ShortTalkUserQueryService {
  /** 발신자 정보를 조회합니다. */
  abstract findSenderInfoById(
    userId: string,
  ): Promise<ShortTalkSenderInfo | undefined>;
}
