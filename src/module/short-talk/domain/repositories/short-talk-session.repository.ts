import { ShortTalkSession } from '../models';

/**
 * Short Talk 세션 Repository 인터페이스
 *
 * In-Memory 저장소를 위한 인터페이스입니다.
 * SSE 연결이 없는 그룹은 세션을 유지하지 않습니다.
 */
export abstract class ShortTalkSessionRepository {
  /**
   * 세션 저장
   */
  abstract save(session: ShortTalkSession): void;

  /**
   * 그룹 ID로 세션 조회
   */
  abstract findById(groupId: string): ShortTalkSession | undefined;

  /**
   * 세션 조회 또는 생성 (원자적 연산)
   * Race Condition 방지를 위해 조회와 생성을 하나의 연산으로 처리
   */
  abstract findOrCreate(groupId: string): ShortTalkSession;

  /**
   * 리스너 제거 (리스너 0명 시 세션 자동 삭제)
   */
  abstract removeListener(groupId: string, userId: string): void;

  /**
   * 세션 삭제
   */
  abstract delete(groupId: string): void;

  /**
   * 닫힌 리스너 정리
   */
  abstract cleanupClosedListeners(): void;
}
