import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { UserLookupService } from '../../domain/services';

@Injectable()
export class UserLookupServiceImpl implements UserLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async existsById(userId: string): Promise<boolean> {
    const count = await this.prisma.public_users.count({
      where: { id: userId },
    });

    return count > 0;
  }
}
