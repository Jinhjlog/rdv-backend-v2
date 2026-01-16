# UseCase 작성 패턴

UseCase는 비즈니스 유즈케이스를 실행하는 애플리케이션 서비스입니다.

## Create UseCase 패턴

```typescript
import { Injectable } from '@nestjs/common';
import { Create{Entity}Dto } from '../dtos';
import { BoundedString } from '@lib/domain';
import { {Entity} } from '../../domain/models';
import { {Entity}Repository } from '../../domain/repositories';

@Injectable()
export class Create{Entity}UseCase {
  constructor(
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute(dto: Create{Entity}Dto): Promise<{ {entity}Id: string }> {
    // 1. Value Objects 생성
    const name = BoundedString.create(dto.name, {
      fieldName: 'name',
      minLength: 1,
      maxLength: 100,
    });

    // 2. 도메인 엔티티 생성
    const {entity} = new {Entity}({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. 저장
    await this.{entity}Repository.save({entity});

    // 4. 결과 반환
    return { {entity}Id: {entity}.id.toString() };
  }
}
```

### 중요 규칙

- `@Injectable()` 데코레이터 필수
- Repository 주입
- `execute(dto)` 메서드: 비즈니스 유즈케이스 실행
- Value Objects는 UseCase에서 생성
- 도메인 엔티티 생성 후 Repository로 저장
- 반환값은 보통 `{ id: string }` 형태

---

## Find Detail UseCase 패턴

```typescript
import { Injectable } from '@nestjs/common';
import { {Entity}QueryRepository } from '../../domain/repositories';
import { {Entity}DetailQueryModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class Find{Entity}DetailUseCase {
  constructor(
    private readonly {entity}QueryRepository: {Entity}QueryRepository,
  ) {}

  async execute(dto: {
    {entity}Id: string;
  }): Promise<{Entity}DetailQueryModel> {
    const detail = await this.{entity}QueryRepository.findDetailById(
      dto.{entity}Id,
    );

    if (!detail) {
      throw new EntityNotFoundException({
        entityName: '{Entity}',
        errorCode: '{ENTITY}_NOT_FOUND',
        id: dto.{entity}Id,
      });
    }

    return detail;
  }
}
```

### 중요 규칙

- Query Repository 사용
- QueryModel 반환 (도메인 엔티티 ❌)
- 없으면 `EntityNotFoundException` 발생

---

## Find List UseCase 패턴

```typescript
import { Injectable } from '@nestjs/common';
import { {Entity}QueryRepository } from '../../domain/repositories';
import { {Entity}ListItemQueryModel } from '../../domain/models';
import { Find{Entity}ListDto } from '../dtos';

@Injectable()
export class Find{Entity}ListUseCase {
  constructor(
    private readonly {entity}QueryRepository: {Entity}QueryRepository,
  ) {}

  async execute(dto: Find{Entity}ListDto): Promise<{Entity}ListItemQueryModel[]> {
    return this.{entity}QueryRepository.findList({
      // 필터 파라미터 전달
      statusFilter: dto.statusFilter,
      cursor: dto.cursor,
      limit: dto.limit,
    });
  }
}
```

### 중요 규칙

- Query Repository 사용
- 필터 파라미터 전달
- QueryModel 배열 반환

---

## Update UseCase 패턴

```typescript
import { Injectable } from '@nestjs/common';
import { Update{Entity}Dto } from '../dtos';
import { BoundedString } from '@lib/domain';
import { {Entity}Repository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class Update{Entity}UseCase {
  constructor(
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute(dto: Update{Entity}Dto): Promise<void> {
    // 1. 엔티티 조회
    const {entity} = await this.{entity}Repository.findById(dto.{entity}Id);

    if (!{entity}) {
      throw new EntityNotFoundException({
        entityName: '{Entity}',
        errorCode: '{ENTITY}_NOT_FOUND',
        id: dto.{entity}Id,
      });
    }

    // 2. Value Objects 생성
    const name = BoundedString.create(dto.name, {
      fieldName: 'name',
      minLength: 1,
      maxLength: 100,
    });

    // 3. 도메인 메서드 호출
    {entity}.updateName(name);

    // 4. 저장
    await this.{entity}Repository.save({entity});
  }
}
```

### 중요 규칙

- 기존 엔티티 조회
- 도메인 메서드로 수정 (직접 props 수정 ❌)
- 저장 후 반환값 없음 (void)

---

## Delete UseCase 패턴

```typescript
import { Injectable } from '@nestjs/common';
import { {Entity}Repository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class Delete{Entity}UseCase {
  constructor(
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute(dto: { {entity}Id: string }): Promise<void> {
    const {entity} = await this.{entity}Repository.findById(dto.{entity}Id);

    if (!{entity}) {
      throw new EntityNotFoundException({
        entityName: '{Entity}',
        errorCode: '{ENTITY}_NOT_FOUND',
        id: dto.{entity}Id,
      });
    }

    await this.{entity}Repository.delete({entity}.id.toString());
  }
}
```

### 중요 규칙

- 존재 여부 확인
- Repository.delete() 호출
- 반환값 없음 (void)

---

## 주의사항

- ❌ UseCase에 비즈니스 로직 직접 작성 (도메인 레이어에 작성)
- ✅ Value Objects는 UseCase에서 생성
- ✅ 도메인 메서드를 통한 수정
- ✅ Query Repository로 조회 시 QueryModel 반환
