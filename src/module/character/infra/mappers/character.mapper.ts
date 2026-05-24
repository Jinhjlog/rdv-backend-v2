import { Prisma, characters as CharacterPrisma } from '@prisma/client';
import { Character, UnlockCondition } from '../../domain/models';
import { PrismaJsonUtil } from '@core/database/prisma-json.util';

export class CharacterMapper {
  static toDomain(prismaCharacter: CharacterPrisma): Character {
    return Character.unsafeCreate({
      id: prismaCharacter.id,
      characterCode: prismaCharacter.character_code,
      name: prismaCharacter.name,
      description: prismaCharacter.description,
      unlockCondition:
        prismaCharacter.unlock_condition !== null
          ? PrismaJsonUtil.deserialize<UnlockCondition>(
              prismaCharacter.unlock_condition,
            )
          : undefined,
      unlockHint: prismaCharacter.unlock_hint ?? undefined,
      isDefault: prismaCharacter.is_default,
      createdAt: prismaCharacter.created_at,
      updatedAt: prismaCharacter.updated_at,
    });
  }

  static toPersistence(
    domainCharacter: Character,
  ): Prisma.charactersUncheckedCreateInput {
    return {
      id: domainCharacter.id.toString(),
      character_code: domainCharacter.characterCode,
      name: domainCharacter.name,
      description: domainCharacter.description,
      unlock_condition: domainCharacter.unlockCondition
        ? PrismaJsonUtil.serialize<UnlockCondition>(
            domainCharacter.unlockCondition,
          )
        : undefined,
      unlock_hint: domainCharacter.unlockHint ?? null,
      is_default: domainCharacter.isDefault,
      created_at: domainCharacter.createdAt,
      updated_at: domainCharacter.updatedAt,
    };
  }
}
