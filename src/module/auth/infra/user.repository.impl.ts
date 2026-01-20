import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '@core/database/prisma.service';
import { UserInfo } from '../interfaces';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserInfo | null> {
    const user = await this.prisma.public_users.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        name_tag: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      nickname: user.nickname,
      nameTag: user.name_tag,
    };
  }
}
