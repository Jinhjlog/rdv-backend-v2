import { Injectable } from '@nestjs/common';
import { UserCharacterRepository } from '../../domain/repositories';
import { UserCharacter } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { UserCharacterMapper } from '../mappers';

@Injectable()
export class UserCharacterRepositoryImpl implements UserCharacterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: UserCharacter): Promise<void> {
    const raw = UserCharacterMapper.toPersistence(entity);

    await this.prisma.user_characters.upsert({
      where: { id: raw.id },
      create: raw,
      update: raw,
    });
  }

  async findByUserIdAndCharacterId(
    userId: string,
    characterId: string,
  ): Promise<UserCharacter | undefined> {
    const raw = await this.prisma.user_characters.findUnique({
      where: {
        user_id_character_id: {
          user_id: userId,
          character_id: characterId,
        },
      },
    });
    if (!raw) {
      return undefined;
    }

    return UserCharacterMapper.toDomain(raw);
  }
}
