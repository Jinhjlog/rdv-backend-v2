# Entity (하위 엔티티) 작성 패턴

Entity는 Aggregate Root에 종속되는 하위 엔티티입니다.

## 정의

- **상속**: `EntityClass<Props>`
- **특징**:
  - 부모 Aggregate 없이 존재 불가
  - 부모 Aggregate ID 필드 필수
  - 부모를 통해서만 접근
- **예시**: `CompanyPostAttachment`, `WorkplaceInspectionItem`

## 기본 구조

```typescript
import { EntityClass, UniqueEntityId } from '@lib/domain';

export interface {EntityName}CreateProps {
  {aggregateRootName}Id: string;
  // 생성에 필요한 필드
  fileName: string;
  fileSize: number;
}

export interface {EntityName}Props {
  id?: string;
  {aggregateRootName}Id: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}

export class {EntityName} extends EntityClass<{EntityName}Props> {
  constructor(props: {EntityName}Props) {
    super(props, new UniqueEntityId(props.id));
  }

  // 부모 Aggregate ID getter (필수)
  get {aggregateRootName}Id(): string {
    return this.props.{aggregateRootName}Id;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // static create 메서드 (optional, 복잡한 생성 로직이 있을 때)
  static create(props: {EntityName}CreateProps): {EntityName} {
    return new {EntityName}({
      ...props,
      createdAt: new Date(),
    });
  }
}
```

## 중요 규칙

- `EntityClass<Props>` 상속 (AggregateRoot 아님!)
- 부모 Aggregate ID 필드 필수 (예: `companyPostId`, `workplaceId`)
- CreateProps는 생성에 필요한 최소 필드만
- Props는 완전한 필드 정의
- static `create()` 메서드는 복잡한 생성 로직이 있을 때만
- Domain Event 발행 불가 (부모 Aggregate Root에서 발행)

## Aggregate Root와 구분

| 구분 | Aggregate Root | Entity (하위) |
|------|---------------|--------------|
| 상속 | `AggregateRoot<Props>` | `EntityClass<Props>` |
| 독립성 | 독립적 존재 가능 | 부모 Aggregate에 종속 |
| 필수 필드 | - | 부모 Aggregate ID |
| Repository | 직접 저장/조회 | 부모를 통해 접근 |
| Domain Event | 발행 가능 | 발행 불가 |
