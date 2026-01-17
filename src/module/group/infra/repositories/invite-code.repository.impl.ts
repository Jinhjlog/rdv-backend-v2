import { Injectable } from '@nestjs/common';
import { InviteCode, InviteCodeRepository } from '../../domain';
import { PrismaService } from '@core/database';
import { InviteCodeMapper } from '../mappers';

@Injectable()
export class InviteCodeRepositoryImpl implements InviteCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: InviteCode): Promise<void> {
    const data = InviteCodeMapper.toPersistence(entity);

    await this.prisma.invite_codes.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: data,
    });
  }

  async findByCode(code: string): Promise<InviteCode | undefined> {
    const prismaInviteCode = await this.prisma.invite_codes.findUnique({
      where: { code },
    });
    if (!prismaInviteCode) {
      return undefined;
    }

    return InviteCodeMapper.toDomain(prismaInviteCode);
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.invite_codes.count({
      where: { code },
    });

    return count > 0;
  }
}
