import { ValueObject } from '@lib/domain';
import * as crypto from 'crypto';

export interface InviteAccessCodeProps {
  value: string;
}

export class InviteAccessCode extends ValueObject<InviteAccessCodeProps> {
  private constructor(props: InviteAccessCodeProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * 그룹에 접근할 수있는 초대 코드를 생성합니다.
   * 랜덤한 접근 코드(8자리)를 생성하고, 중복 검사를 통해 고유성을 보장합니다.
   *
   * crypto.randomBytes를 사용하여 암호학적으로 안전한 랜덤 값을 생성하고,
   * 숫자만 사용하여 사용자 친화적인 코드를 만듭니다.
   *
   * @param existsChecker 코드 존재 여부를 확인하는 함수
   * @returns InviteAccessCode 인스턴스
   */
  static async createUnique(
    existsChecker: (code: string) => Promise<boolean>,
  ): Promise<InviteAccessCode> {
    let accessCode: InviteAccessCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      accessCode = this.generate();
      attempts++;
    } while ((await existsChecker(accessCode.value)) && attempts < maxAttempts);

    return accessCode;
  }

  private static generate(): InviteAccessCode {
    const chars = '0123456789';

    // crypto.randomBytes로 암호학적으로 안전한 랜덤 바이트 생성
    const randomBytes = crypto.randomBytes(8);

    // 각 바이트를 chars 배열의 인덱스로 변환
    const code = Array.from(
      randomBytes,
      (byte) => chars[byte % chars.length],
    ).join('');

    return new InviteAccessCode({ value: code });
  }

  static unsafeCreate(value: string): InviteAccessCode {
    return new InviteAccessCode({ value });
  }
}
