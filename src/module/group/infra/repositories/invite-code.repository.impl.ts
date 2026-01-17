import { Injectable } from '@nestjs/common';
import { InviteCode, InviteCodeRepository } from '../../domain';
import { PrismaService, PrismaTransactionClient } from '@core/database';
import { InviteCodeMapper } from '../mappers';
import { TransactionContextService } from '@lib/infra/unit-of-work';

@Injectable()
export class InviteCodeRepositoryImpl implements InviteCodeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: TransactionContextService<PrismaTransactionClient>,
  ) {}

  private get client(): PrismaService | PrismaTransactionClient {
    const tx = this.txContext.getTransactionContext();
    return tx ?? this.prisma;
  }

  async save(entity: InviteCode): Promise<void> {
    const data = InviteCodeMapper.toPersistence(entity);

    await this.client.invite_codes.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: data,
    });
  }

  async findByCode(code: string): Promise<InviteCode | undefined> {
    const prismaInviteCode = await this.client.invite_codes.findUnique({
      where: { code },
    });
    if (!prismaInviteCode) {
      return undefined;
    }

    return InviteCodeMapper.toDomain(prismaInviteCode);
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.client.invite_codes.count({
      where: { code },
    });

    return count > 0;
  }
}
