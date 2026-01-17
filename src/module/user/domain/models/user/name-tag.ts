import { ValueObject } from '@lib/domain';
import * as crypto from 'crypto';

const CODE_LENGTH = 4;

export interface NameTagProps {
  value: string;
}

export class NameTag extends ValueObject<{ value: string }> {
  private constructor(readonly props: { value: string }) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(): NameTag {
    const random4Digits = crypto
      .randomInt(0, 10000)
      .toString()
      .padStart(CODE_LENGTH, '0');

    return new NameTag({ value: `#${random4Digits}` });
  }

  static unsafeCreate(value: string): NameTag {
    return new NameTag({ value });
  }
}
