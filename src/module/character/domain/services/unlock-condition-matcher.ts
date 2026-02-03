import { UnlockCondition } from '../models';

export class UnlockConditionMatcher {
  /**
   * 클라이언트 이벤트 페이로드가 언락 조건과 매칭되는지 확인
   *
   * @param condition DB에 저장된 언락 조건
   * @param payload 클라이언트로부터 받은 이벤트 페이로드
   * @returns 조건 충족 여부
   */
  static matches(
    condition: UnlockCondition,
    payload: Record<string, unknown>,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { eventType, ...requirements } = condition;

    return Object.entries(requirements).every(([key, expected]) => {
      const actual = payload[key];

      if (typeof expected === 'number') {
        return typeof actual === 'number' && actual >= expected;
      }

      if (typeof expected === 'string') {
        return actual === expected;
      }

      if (typeof expected === 'boolean') {
        return actual === expected;
      }

      return false;
    });
  }
}
