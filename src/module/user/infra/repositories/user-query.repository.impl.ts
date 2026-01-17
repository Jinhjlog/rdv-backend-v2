import { Injectable } from '@nestjs/common';
import { UserQueryRepository } from '../../domain/repositories';
import { PrismaService } from '@core/database';
import { UserQueryModel } from '../../domain/models';

@Injectable()
export class UserQueryRepositoryImpl implements UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string): Promise<UserQueryModel | undefined> {
    const user = await this.prisma.public_users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        name_tag: true,
        preferred_theme_color: true,
        character_code: true,
        level: true,
        experience: true,
      },
    });
    if (!user) {
      return undefined;
    }

    return {
      id: user.id,
      nickname: user.nickname,
      nameTag: user.name_tag,
      preferredThemeColor: user.preferred_theme_color,
      characterCode: user.character_code,
      level: user.level,
      experience: user.experience,
    };
  }
}
