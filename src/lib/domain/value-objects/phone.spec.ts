import { ValueObjectValidationException } from '@shared/exception';
import { Phone, PhoneError } from './phone';

describe('Phone', () => {
  describe('유효성 검사', () => {
    it('유효하지 않은 전화번호 형식으로 예외가 발생합니다 - 문자 포함', () => {
      // given
      const invalidPhone = '010123456a';

      // when & then
      expect(() => Phone.create(invalidPhone)).toThrow(
        new ValueObjectValidationException({
          entityName: Phone.name,
          reason: PhoneError.InvalidPhone,
          errorCode: 'INVALID_PHONE',
        }),
      );
    });

    it('유효하지 않은 전화번호 형식으로 예외가 발생합니다 - 길이 부족', () => {
      // given
      const tooShortPhone = '123456789';

      // when & then
      expect(() => Phone.create(tooShortPhone)).toThrow(
        new ValueObjectValidationException({
          entityName: Phone.name,
          reason: PhoneError.InvalidPhone,
          errorCode: 'INVALID_PHONE',
        }),
      );
    });

    it('유효하지 않은 전화번호 형식으로 예외가 발생합니다 - 길이 초과', () => {
      // given
      const tooLongPhone = '123456789012';

      // when & then
      expect(() => Phone.create(tooLongPhone)).toThrow(
        new ValueObjectValidationException({
          entityName: Phone.name,
          reason: PhoneError.InvalidPhone,
          errorCode: 'INVALID_PHONE',
        }),
      );
    });

    it('유효하지 않은 전화번호 형식으로 예외가 발생합니다 - 특수문자 포함', () => {
      // given
      const phoneWithSymbols = '010-1234-5678';

      // when & then
      expect(() => Phone.create(phoneWithSymbols)).toThrow(
        new ValueObjectValidationException({
          entityName: Phone.name,
          reason: PhoneError.InvalidPhone,
          errorCode: 'INVALID_PHONE',
        }),
      );
    });
  });

  describe('create', () => {
    it('10자리 전화번호로 Phone 객체를 생성합니다', () => {
      // given
      const validPhone = '0212345678';

      // when
      const phoneObject = Phone.create(validPhone);

      // then
      expect(phoneObject).toBeInstanceOf(Phone);
    });

    it('11자리 휴대폰 번호로 Phone 객체를 생성합니다', () => {
      // given
      const validPhone = '01012345678';

      // when
      const phoneObject = Phone.create(validPhone);

      // then
      expect(phoneObject).toBeInstanceOf(Phone);
    });
  });
});
