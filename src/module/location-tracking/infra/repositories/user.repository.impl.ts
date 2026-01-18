import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories';
import { PrismaService } from '@core/database';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    userId: string,
  ): Promise<
    { nickname: string; nameTag: string; characterCode: string } | undefined
  > {
    const user = await this.prisma.public_users.findUnique({
      where: { id: userId },
      select: {
        nickname: true,
        name_tag: true,
        character_code: true,
      },
    });
    if (!user) {
      return undefined;
    }

    return {
      nickname: user.nickname,
      nameTag: user.name_tag,
      characterCode: user.character_code,
    };
  }
}
