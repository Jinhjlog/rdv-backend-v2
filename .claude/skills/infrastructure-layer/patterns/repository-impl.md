# Repository 구현체 작성 패턴

Repository 구현체는 Domain Repository 인터페이스를 Prisma로 구현합니다.

## 기본 구조

```typescript
import { Injectable } from '@nestjs/common';
import { {Entity}Repository } from '../../domain/repositories';
import { {Entity} } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { {Entity}Mapper } from '../mappers';
import { DomainEvents } from '@lib/domain/events/domain-events';

@Injectable()
export class {Entity}RepositoryImpl implements {Entity}Repository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: {Entity}): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const data = {Entity}Mapper.toPersistence(entity);

      await tx.{entity_table}.upsert({
        where: { id: entity.id.toString() },
        update: data,
        create: data,
      });

      // 하위 엔티티 처리 (있는 경우)
      // 1. 제거된 항목 삭제
      // 2. 남은 항목 upsert
    });

    // Domain Events 발행
    if (entity.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(entity.id);
    }
  }

  async findById(id: string): Promise<{Entity} | undefined> {
    const raw = await this.prisma.{entity_table}.findUnique({
      where: { id },
      include: { /* 관계 포함 */ },
    });

    if (!raw) {
      return undefined;
    }

    return {Entity}Mapper.toDomain(raw);
  }

  // TODO: 필요한 추가 메서드 구현
}
```

## 중요 규칙

- `@Injectable()` 데코레이터 필수
- Domain Repository 인터페이스 구현
- PrismaService 주입
- `save()`는 트랜잭션으로 처리
- Domain Events는 저장 후 발행
- 하위 엔티티는 Orphan 제거 로직 포함

## 하위 Entity 처리 예시

```typescript
async save(entity: CompanyPost): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    const data = CompanyPostMapper.toPersistence(entity);

    await tx.company_post.upsert({
      where: { id: entity.id.toString() },
      update: data,
      create: data,
    });

    // 하위 엔티티 처리 (첨부파일)
    const existingIds = entity.attachments.map(a => a.id.toString());

    // 1. DB에는 있지만 entity에는 없는 항목 삭제 (Orphan Removal)
    await tx.company_post_attachment.deleteMany({
      where: {
        company_post_id: entity.id.toString(),
        id: { notIn: existingIds },
      },
    });

    // 2. 남은 항목들 upsert
    for (const attachment of entity.attachments) {
      const attachmentData = CompanyPostAttachmentMapper.toPersistence(attachment);
      await tx.company_post_attachment.upsert({
        where: { id: attachment.id.toString() },
        update: attachmentData,
        create: attachmentData,
      });
    }
  });

  // Domain Events 발행
  if (entity.domainEvents.length > 0) {
    DomainEvents.dispatchEventsForAggregate(entity.id);
  }
}
```

## 주의사항

- ❌ 비즈니스 로직 포함 금지
- ✅ 트랜잭션으로 일관성 보장
- ✅ Domain Events 발행 필수
- ✅ 하위 엔티티 Orphan Removal 처리
