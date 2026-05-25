import { Injectable } from '@nestjs/common';
import { UserQueryService } from '../../domain/services';
import { PrismaService } from '@core/database';
import { UserReadModel } from '../../domain/models';

@Injectable()
export class UserQueryServiceImpl implements UserQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string): Promise<UserReadModel | undefined> {
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
