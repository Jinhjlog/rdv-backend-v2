/**
 * 언락 조건 서버 검증 리졸버 인터페이스
 *
 * eventType별로 서버에서 실제 데이터를 조회하여 payload를 생성합니다.
 * 클라이언트 payload를 신뢰하지 않고 서버에서 직접 검증할 때 사용합니다.
 */
export interface UnlockConditionResolver {
  /**
   * 이 리졸버가 처리하는 이벤트 타입
   */
  readonly eventType: string;

  /**
   * 서버에서 실제 데이터를 조회하여 payload를 생성합니다.
   *
   * @param userId 사용자 ID
   * @returns 언락 조건 매칭에 사용할 payload
   */
  resolve(userId: string): Promise<Record<string, unknown>>;
}

/**
 * 개별 리졸버 등록용 토큰
 *
 * 모듈에서 provide: UNLOCK_CONDITION_RESOLVER 로 여러 번 등록하면
 * UseCase에서 배열로 주입받을 수 있습니다.
 */
export const UNLOCK_CONDITION_RESOLVER = Symbol('UNLOCK_CONDITION_RESOLVER');
