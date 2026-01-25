import { Injectable } from '@nestjs/common';
import {
  ProfanityFilterService,
  ProfanityCheckResult,
  ProfanityMaskResult,
} from './profanity-filter.service';
import {
  KOREAN_BAD_WORDS,
  KOREAN_BAD_CHOSUNGS,
  NUMBER_PROFANITY_PATTERNS,
} from './data/korean-bad-words';

/**
 * 한국어 욕설 필터 서비스
 *
 * 다양한 우회 패턴을 감지합니다:
 * - 숫자 삽입 (시8, 18놈)
 * - 공백/특수문자 삽입 (시 발, 시-발)
 * - 초성 패턴 (ㅅㅂ, ㅂㅅ)
 * - 반복 문자 (시이발, 씨발ㄹㄹ)
 */
@Injectable()
export class KoreanProfanityFilterService extends ProfanityFilterService {
  private readonly badWords: Set<string>;
  private readonly badChosungs: Set<string>;
  private readonly badWordPatterns: RegExp[];

  constructor() {
    super();
    this.badWords = new Set(KOREAN_BAD_WORDS.map((w) => w.toLowerCase()));
    this.badChosungs = new Set(KOREAN_BAD_CHOSUNGS);
    this.badWordPatterns = this.buildPatterns();
  }

  /**
   * 욕설 검사 정규식 패턴 생성
   */
  private buildPatterns(): RegExp[] {
    const patterns: RegExp[] = [];

    // 각 욕설에 대해 유연한 패턴 생성
    for (const word of KOREAN_BAD_WORDS) {
      if (word.length >= 2) {
        // 문자 사이에 공백/특수문자/숫자가 들어갈 수 있는 패턴
        const flexiblePattern = word
          .split('')
          .map((char) => this.escapeRegex(char))
          .join('[\\s\\-_.!@#$%^&*()0-9]*');

        patterns.push(new RegExp(flexiblePattern, 'gi'));
      }
    }

    return patterns;
  }

  /**
   * 정규식 특수문자 이스케이프
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 텍스트 정규화 (검사용)
   * - 공백/특수문자 제거
   * - 숫자→한글 변환
   * - 소문자 변환
   */
  private normalizeText(text: string): string {
    let normalized = text.toLowerCase();

    // 숫자 패턴 변환
    for (const [pattern, replacement] of Object.entries(
      NUMBER_PROFANITY_PATTERNS,
    )) {
      normalized = normalized.replace(new RegExp(pattern, 'gi'), replacement);
    }

    // 공백, 특수문자 제거
    normalized = normalized.replace(/[\s\-_.!@#$%^&*()]/g, '');

    // 반복 문자 축소 (예: 시이발 → 시발)
    normalized = normalized.replace(/(.)\1+/g, '$1');

    return normalized;
  }

  /**
   * 초성 추출
   */
  private extractChosung(text: string): string {
    const CHOSUNG = [
      'ㄱ',
      'ㄲ',
      'ㄴ',
      'ㄷ',
      'ㄸ',
      'ㄹ',
      'ㅁ',
      'ㅂ',
      'ㅃ',
      'ㅅ',
      'ㅆ',
      'ㅇ',
      'ㅈ',
      'ㅉ',
      'ㅊ',
      'ㅋ',
      'ㅌ',
      'ㅍ',
      'ㅎ',
    ];

    let result = '';
    for (const char of text) {
      const code = char.charCodeAt(0);

      // 한글 완성형 (가-힣)
      if (code >= 0xac00 && code <= 0xd7a3) {
        const chosungIndex = Math.floor((code - 0xac00) / 588);
        result += CHOSUNG[chosungIndex];
      }
      // 이미 초성인 경우
      else if (CHOSUNG.includes(char)) {
        result += char;
      }
    }

    return result;
  }

  checkProfanity(text: string): ProfanityCheckResult {
    if (!text || text.trim().length === 0) {
      return { hasProfanity: false, detectedWords: [] };
    }

    const detectedWords: string[] = [];
    const normalizedText = this.normalizeText(text);

    // 1. 정규화된 텍스트에서 직접 매칭
    for (const word of this.badWords) {
      if (normalizedText.includes(word)) {
        if (!detectedWords.includes(word)) {
          detectedWords.push(word);
        }
      }
    }

    // 2. 유연한 패턴 매칭 (원본 텍스트)
    for (const pattern of this.badWordPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const normalized = this.normalizeText(match);
          if (!detectedWords.includes(normalized)) {
            detectedWords.push(normalized);
          }
        }
      }
    }

    // 3. 초성 패턴 검사
    const chosung = this.extractChosung(text);
    for (const badChosung of this.badChosungs) {
      if (chosung.includes(badChosung)) {
        if (!detectedWords.includes(badChosung)) {
          detectedWords.push(badChosung);
        }
      }
    }

    // 4. 순수 초성 텍스트 검사 (ㅅㅂ 등 직접 입력)
    const chosungOnly = text.replace(/[^\u3131-\u3163]/g, '');
    for (const badChosung of this.badChosungs) {
      if (chosungOnly.includes(badChosung)) {
        if (!detectedWords.includes(badChosung)) {
          detectedWords.push(badChosung);
        }
      }
    }

    return {
      hasProfanity: detectedWords.length > 0,
      detectedWords,
    };
  }

  maskProfanity(text: string, maskChar: string = '*'): ProfanityMaskResult {
    if (!text || text.trim().length === 0) {
      return { maskedText: text, maskCount: 0 };
    }

    let maskedText = text;
    let maskCount = 0;

    // 1. 욕설 단어 마스킹
    for (const word of KOREAN_BAD_WORDS) {
      const regex = new RegExp(this.escapeRegex(word), 'gi');
      const matches = maskedText.match(regex);
      if (matches) {
        maskCount += matches.length;
        maskedText = maskedText.replace(
          regex,
          maskChar.repeat(Math.min(word.length, 3)),
        );
      }
    }

    // 2. 유연한 패턴 마스킹 (공백/특수문자 포함 패턴)
    for (const pattern of this.badWordPatterns) {
      const matches = maskedText.match(pattern);
      if (matches) {
        for (const match of matches) {
          // 이미 마스킹된 부분은 건너뛰기
          if (!match.includes(maskChar)) {
            maskCount++;
            maskedText = maskedText.replace(
              match,
              maskChar.repeat(Math.min(match.length, 3)),
            );
          }
        }
      }
    }

    // 3. 초성 욕설 마스킹
    for (const chosung of KOREAN_BAD_CHOSUNGS) {
      const regex = new RegExp(this.escapeRegex(chosung), 'g');
      const matches = maskedText.match(regex);
      if (matches) {
        maskCount += matches.length;
        maskedText = maskedText.replace(
          regex,
          maskChar.repeat(Math.min(chosung.length, 2)),
        );
      }
    }

    return { maskedText, maskCount };
  }
}
