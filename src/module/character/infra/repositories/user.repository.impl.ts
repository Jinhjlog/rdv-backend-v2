import { PrismaService } from '@core/database';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsById(userId: string): Promise<boolean> {
    const count = await this.prisma.public_users.count({
      where: { id: userId },
    });

    return count > 0;
  }
}
