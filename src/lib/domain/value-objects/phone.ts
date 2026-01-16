import { ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

interface PhoneProps {
  value: string;
}

export const PhoneError = {
  InvalidPhone: '유효하지 않은 전화번호 형식입니다.',
} as const;

export class Phone extends ValueObject<PhoneProps> {
  private constructor(props: PhoneProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValidPhone(value: string): boolean {
    const regex = /^[0-9]{10,11}$/;
    return regex.test(value);
  }

  /**
   * 전화번호 Value Object
   *
   * @throws {ValueObjectValidationException} INVALID_PHONE - 유효하지 않은 전화번호 형식입니다.
   */
  static create(phone: string) {
    if (!this.isValidPhone(phone)) {
      throw new ValueObjectValidationException({
        entityName: Phone.name,
        reason: PhoneError.InvalidPhone,
        errorCode: 'INVALID_PHONE',
      });
    }

    return new Phone({ value: phone });
  }

  static unsafeCreate(phone: string): Phone {
    return new Phone({ value: phone });
  }
}
