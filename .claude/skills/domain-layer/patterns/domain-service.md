# Domain Service 작성 패턴

Domain Service는 복잡한 도메인 로직을 캡슐화합니다.

## 기본 구조

```typescript
import { Injectable } from '@nestjs/common';
import { {EntityName} } from '../models';
import { {EntityName}Repository } from '../repositories';
import { BoundedString } from '@lib/domain';

export interface Create{EntityName}Input {
  // 입력 파라미터 (primitive types)
  name: string;
}

@Injectable()
export class {EntityName}CreationService {
  constructor(
    private readonly repository: {EntityName}Repository,
  ) {}

  /**
   * {EntityName}을(를) 생성합니다.
   *
   * @param input 생성 정보
   * @returns 생성된 {EntityName} 엔티티
   * @throws {EntityNotFoundException} ERROR_CODE - 에러 설명
   */
  async create(input: Create{EntityName}Input): Promise<{EntityName}> {
    // 1. 의존성 체크 (다른 엔티티 존재 여부 등)

    // 2. Value Objects 생성
    const name = BoundedString.create(input.name, {
      fieldName: 'name',
      minLength: 1,
      maxLength: 100,
    });

    // 3. Entity 생성
    const entity = new {EntityName}({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return entity;
  }
}
```

## 중요 규칙

- `@Injectable()` 데코레이터 필수
- Input 인터페이스는 primitive types 사용
- Value Objects는 서비스 내부에서 생성
- 도메인 엔티티 반환
- JSDoc으로 에러 케이스 문서화
- 복잡한 생성/변경 로직만 Domain Service로 분리
- 단순한 로직은 UseCase에서 직접 처리

## 언제 사용하는가?

- 여러 엔티티를 조합하는 복잡한 로직
- 비즈니스 규칙 검증이 필요한 경우
- 도메인 지식이 필요한 계산
- 단일 엔티티로 해결할 수 없는 로직
