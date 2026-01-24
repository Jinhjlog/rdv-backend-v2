import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ShortTalkUserQueryRepository } from '../../domain/repositories/short-talk-user-query.repository';
import { ShortTalkSenderInfo } from '../../domain/models/short-talk/short-talk-event';

@Injectable()
export class ShortTalkUserQueryRepositoryImpl implements ShortTalkUserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSenderInfoById(
    userId: string,
  ): Promise<ShortTalkSenderInfo | undefined> {
    const user = await this.prisma.public_users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        name_tag: true,
        character_code: true,
        preferred_theme_color: true,
      },
    });

    if (!user) {
      return undefined;
    }

    return {
      id: user.id,
      nickname: user.nickname,
      nameTag: user.name_tag,
      characterCode: user.character_code,
      preferredThemeColor: user.preferred_theme_color,
    };
  }
}
