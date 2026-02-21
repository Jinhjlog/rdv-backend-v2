/**
 * 푸시 토큰 조회/관리 Repository
 *
 * device-token 모듈에 대한 직접 의존 없이 device_tokens 테이블에 접근합니다.
 * 푸시 알림 발송에 필요한 토큰 조회 및 실패 토큰 삭제만 담당합니다.
 */
export abstract class PushTokenRepository {
  /** 사용자 ID로 FCM 토큰 문자열 조회 */
  abstract findTokenByUserId(userId: string): Promise<string | undefined>;

  /** 여러 사용자 ID로 FCM 토큰 문자열 일괄 조회 */
  abstract findTokensByUserIds(userIds: string[]): Promise<string[]>;

  /** 여러 FCM 토큰 일괄 삭제 (발송 실패 토큰 정리) */
  abstract deleteByTokens(tokens: string[]): Promise<void>;
}
