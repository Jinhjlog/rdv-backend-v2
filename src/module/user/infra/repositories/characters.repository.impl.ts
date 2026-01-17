import { Injectable } from '@nestjs/common';
import { CharactersRepository } from '../../domain/repositories';
import { PrismaService } from '@core/database';
import { DataIntegrityException } from '@shared/exception';

@Injectable()
export class CharactersRepositoryImpl implements CharactersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDefaultCharacterCode(): Promise<string> {
    const defaultCharacter = await this.prisma.characters.findFirst({
      where: { is_default: true },
      select: { character_code: true },
    });
    if (!defaultCharacter) {
      throw new DataIntegrityException({
        entityName: 'Character',
        reason: '기본 캐릭터가 설정되어 있지 않습니다',
        errorCode: 'DEFAULT_CHARACTER_NOT_FOUND',
      });
    }

    return defaultCharacter.character_code;
  }

  async existsUserCharacter(
    userId: string,
    characterCode: string,
  ): Promise<boolean> {
    const userCharacter = await this.prisma.user_characters.findFirst({
      where: {
        user_id: userId,
        characters: {
          character_code: characterCode,
        },
      },
    });

    return userCharacter !== null;
  }
}
