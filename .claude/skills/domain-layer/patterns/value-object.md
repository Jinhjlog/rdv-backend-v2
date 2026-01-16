# Value Object 작성 패턴

Value Object는 불변 값을 나타내는 객체입니다.

## 기본 구조

```typescript
import { ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

export const {ValueObjectName}Error = {
  InvalidFormat: '유효하지 않은 형식입니다.',
  // 기타 에러 메시지
} as const;

interface {ValueObjectName}Props {
  value: string;
}

export class {ValueObjectName} extends ValueObject<{ValueObjectName}Props> {
  private constructor(props: {ValueObjectName}Props) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * {ValueObjectName}을 생성합니다
   * @param value 값
   * @throws {ValueObjectValidationException} INVALID_FORMAT - 유효하지 않은 형식
   */
  static create(value: string): {ValueObjectName} {
    // Validation 로직
    if (!value || value.trim().length === 0) {
      throw new ValueObjectValidationException({
        entityName: {ValueObjectName}.name,
        reason: {ValueObjectName}Error.InvalidFormat,
        errorCode: 'INVALID_FORMAT',
      });
    }

    return new {ValueObjectName}({ value: value.trim() });
  }

  /**
   * 검증 없이 생성 (매퍼용)
   */
  static unsafeCreate(value: string): {ValueObjectName} {
    return new {ValueObjectName}({ value });
  }
}
```

## 중요 규칙

- private constructor
- static `create()`: validation 포함
- static `unsafeCreate()`: validation 없음 (매퍼에서 사용)
- Error 상수 객체는 `as const`로 정의
- `ValueObjectValidationException` 사용

## @lib/domain 내장 Value Objects

대부분의 경우 직접 만들지 말고 내장 Value Objects를 사용:

| Value Object | 용도 |
|-------------|------|
| `BoundedString` | 길이 제한이 있는 문자열 |
| `Email` | 이메일 형식 |
| `Phone` | 전화번호 형식 |
| `PositiveNumber` | 양수 |
| `UniqueEntityId` | 엔티티 ID |
