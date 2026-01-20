import {
  Prisma,
  characters as CharacterPrisma,
} from '@prisma/client';
import { Character } from '../../domain/models';
import { PrismaJsonUtil } from '@core/database/prisma-json.util';

/**
 * CharacterMapper
 *
 * 영속성 계층의 Character을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class CharacterMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param {CharacterPrisma} prismaCharacter Prisma 모델
   * @returns {Character} 도메인 Aggregate Root
   */
  static toDomain(prismaCharacter: CharacterPrisma): Character {
    return new Character({
      id: prismaCharacter.id,
      characterCode: prismaCharacter.character_code,
      name: prismaCharacter.name,
      description: prismaCharacter.description,
      unlockCondition:
        prismaCharacter.unlock_condition !== null
          ? PrismaJsonUtil.deserialize<Record<string, unknown>>(
              prismaCharacter.unlock_condition,
            )
          : undefined,
      isDefault: prismaCharacter.is_default,
      createdAt: prismaCharacter.created_at,
      updatedAt: prismaCharacter.updated_at,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param {Character} domainCharacter 도메인 Aggregate Root
   * @returns {Prisma.charactersCreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(
    domainCharacter: Character,
  ): Prisma.charactersCreateInput {
    return {
      id: domainCharacter.id.toString(),
      character_code: domainCharacter.characterCode,
      name: domainCharacter.name,
      description: domainCharacter.description,
      unlock_condition: domainCharacter.unlockCondition
        ? PrismaJsonUtil.serialize<Record<string, unknown>>(
            domainCharacter.unlockCondition,
          )
        : undefined,
      is_default: domainCharacter.isDefault,
      created_at: domainCharacter.createdAt,
      updated_at: domainCharacter.updatedAt,
    };
  }
}
