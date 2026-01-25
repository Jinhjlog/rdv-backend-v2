import { KoreanProfanityFilterService } from './korean-profanity-filter.service';

describe('KoreanProfanityFilterService', () => {
  let service: KoreanProfanityFilterService;

  beforeEach(() => {
    service = new KoreanProfanityFilterService();
  });

  describe('checkProfanity', () => {
    describe('욕설이 없는 경우', () => {
      it('일반 텍스트는 욕설로 감지되지 않아야 함', () => {
        const result = service.checkProfanity('안녕하세요');
        expect(result.hasProfanity).toBe(false);
        expect(result.detectedWords).toHaveLength(0);
      });

      it('빈 문자열은 욕설로 감지되지 않아야 함', () => {
        const result = service.checkProfanity('');
        expect(result.hasProfanity).toBe(false);
      });

      it('공백만 있는 경우 욕설로 감지되지 않아야 함', () => {
        const result = service.checkProfanity('   ');
        expect(result.hasProfanity).toBe(false);
      });
    });

    describe('기본 욕설 감지', () => {
      it('일반적인 욕설을 감지해야 함', () => {
        const result = service.checkProfanity('씨발');
        expect(result.hasProfanity).toBe(true);
        expect(result.detectedWords).toContain('씨발');
      });

      it('문장 내 욕설을 감지해야 함', () => {
        const result = service.checkProfanity('야 씨발 뭐해');
        expect(result.hasProfanity).toBe(true);
      });

      it('비하 욕설을 감지해야 함', () => {
        const result = service.checkProfanity('병신');
        expect(result.hasProfanity).toBe(true);
      });
    });

    describe('변형 패턴 감지', () => {
      it('숫자가 포함된 욕설을 감지해야 함 (시8)', () => {
        const result = service.checkProfanity('시8');
        expect(result.hasProfanity).toBe(true);
      });

      it('공백이 삽입된 욕설을 감지해야 함', () => {
        const result = service.checkProfanity('씨 발');
        expect(result.hasProfanity).toBe(true);
      });

      it('특수문자가 삽입된 욕설을 감지해야 함', () => {
        const result = service.checkProfanity('씨-발');
        expect(result.hasProfanity).toBe(true);
      });

      it('반복 문자가 포함된 욕설을 감지해야 함', () => {
        const result = service.checkProfanity('씨발발');
        expect(result.hasProfanity).toBe(true);
      });
    });

    describe('초성 패턴 감지', () => {
      it('초성 욕설을 감지해야 함 (ㅅㅂ)', () => {
        const result = service.checkProfanity('ㅅㅂ');
        expect(result.hasProfanity).toBe(true);
      });

      it('초성 욕설을 감지해야 함 (ㅂㅅ)', () => {
        const result = service.checkProfanity('ㅂㅅ');
        expect(result.hasProfanity).toBe(true);
      });

      it('문장 내 초성 욕설을 감지해야 함', () => {
        const result = service.checkProfanity('야 ㅅㅂ 뭐해');
        expect(result.hasProfanity).toBe(true);
      });
    });

    describe('대소문자 무시', () => {
      it('영어 욕설은 대소문자 무관하게 감지해야 함', () => {
        const result1 = service.checkProfanity('FUCK');
        const result2 = service.checkProfanity('fuck');
        const result3 = service.checkProfanity('Fuck');

        expect(result1.hasProfanity).toBe(true);
        expect(result2.hasProfanity).toBe(true);
        expect(result3.hasProfanity).toBe(true);
      });
    });
  });

  describe('maskProfanity', () => {
    describe('기본 마스킹', () => {
      it('욕설을 마스킹 처리해야 함', () => {
        const result = service.maskProfanity('씨발');
        expect(result.maskedText).not.toContain('씨발');
        expect(result.maskedText).toContain('*');
        expect(result.maskCount).toBeGreaterThan(0);
      });

      it('문장 내 욕설만 마스킹해야 함', () => {
        const result = service.maskProfanity('야 씨발 뭐해');
        expect(result.maskedText).toContain('야');
        expect(result.maskedText).toContain('뭐해');
        expect(result.maskedText).not.toContain('씨발');
      });

      it('욕설이 없으면 원본 텍스트를 반환해야 함', () => {
        const result = service.maskProfanity('안녕하세요');
        expect(result.maskedText).toBe('안녕하세요');
        expect(result.maskCount).toBe(0);
      });
    });

    describe('빈 입력 처리', () => {
      it('빈 문자열은 그대로 반환해야 함', () => {
        const result = service.maskProfanity('');
        expect(result.maskedText).toBe('');
        expect(result.maskCount).toBe(0);
      });
    });

    describe('초성 욕설 마스킹', () => {
      it('초성 욕설을 마스킹해야 함', () => {
        const result = service.maskProfanity('ㅅㅂ');
        expect(result.maskedText).not.toContain('ㅅㅂ');
        expect(result.maskCount).toBeGreaterThan(0);
      });
    });

    describe('커스텀 마스크 문자', () => {
      it('커스텀 마스크 문자를 사용할 수 있어야 함', () => {
        const result = service.maskProfanity('씨발', '#');
        expect(result.maskedText).toContain('#');
        expect(result.maskedText).not.toContain('*');
      });
    });

    describe('여러 욕설 처리', () => {
      it('여러 욕설을 모두 마스킹해야 함', () => {
        const result = service.maskProfanity('씨발 병신');
        expect(result.maskedText).not.toContain('씨발');
        expect(result.maskedText).not.toContain('병신');
        expect(result.maskCount).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
