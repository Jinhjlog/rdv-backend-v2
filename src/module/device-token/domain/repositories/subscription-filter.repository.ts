import { AlertPushTypeCode } from '../constants';

/**
 * 알림 구독 필터링 Repository
 *
 * 특정 알림 타입을 구독 중인 유저 ID를 조회합니다.
 * notification 모듈의 구독 데이터를 device-token 모듈 경계 내에서 사용하기 위한 인터페이스입니다.
 */
export abstract class SubscriptionFilterRepository {
  /** 특정 알림 타입을 구독 중인 유저 ID 목록 조회 */
  abstract findSubscribedUserIdsByType(
    type: AlertPushTypeCode,
  ): Promise<string[]>;
}
