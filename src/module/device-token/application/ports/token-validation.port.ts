/**
 * 토큰 유효성 검증 Port
 *
 * FCM 디바이스 토큰의 유효성을 검증하기 위한 추상화 계층입니다.
 *
 * - Production: FcmTokenValidationAdapter (Firebase Admin SDK dry-run)
 * - Test: MockTokenValidationAdapter (항상 true 반환)
 */
export abstract class TokenValidationPort {
  /** FCM 디바이스 토큰의 유효성을 검사합니다. */
  abstract validateToken(token: string): Promise<boolean>;
}
