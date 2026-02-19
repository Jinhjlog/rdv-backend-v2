/**
 * Notification 도메인에서 필요한 User 조회 인터페이스
 *
 * UserModule에 대한 직접 의존 없이 전체 유저 ID를 조회합니다.
 * 브로드캐스트 알림 생성 시 사용됩니다.
 */
export abstract class NotificationUserRepository {
  abstract findAllIds(): Promise<string[]>;
}
