/**
 * 욕설 필터 서비스 추상 인터페이스
 *
 * 다양한 언어/정책에 대응하기 위해 추상화
 */

/**
 * 욕설 검사 결과
 */
export interface ProfanityCheckResult {
  /** 욕설 포함 여부 */
  hasProfanity: boolean;
  /** 감지된 욕설 목록 */
  detectedWords: string[];
}

/**
 * 욕설 마스킹 결과
 */
export interface ProfanityMaskResult {
  /** 마스킹된 텍스트 */
  maskedText: string;
  /** 마스킹된 횟수 */
  maskCount: number;
}

/**
 * 욕설 필터 서비스 추상 클래스
 */
export abstract class ProfanityFilterService {
  /**
   * 텍스트에서 욕설 포함 여부를 검사합니다
   *
   * @param text 검사할 텍스트
   * @returns 욕설 검사 결과
   */
  abstract checkProfanity(text: string): ProfanityCheckResult;

  /**
   * 텍스트에서 욕설을 마스킹 처리합니다
   *
   * @param text 마스킹할 텍스트
   * @param maskChar 마스킹에 사용할 문자 (기본값: '*')
   * @returns 마스킹 결과
   */
  abstract maskProfanity(text: string, maskChar?: string): ProfanityMaskResult;
}
