import { Prisma, user_characters as UserCharacterPrisma } from '@prisma/client';
import { UserCharacter } from '../../domain/models';

/**
 * UserCharacterMapper
 *
 * 영속성 계층의 UserCharacter를 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class UserCharacterMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param {UserCharacterPrisma} prismaUserCharacter Prisma 모델
   * @returns {UserCharacter} 도메인 Aggregate Root
   */
  static toDomain(prismaUserCharacter: UserCharacterPrisma): UserCharacter {
    return UserCharacter.unsafeCreate({
      id: prismaUserCharacter.id,
      userId: prismaUserCharacter.user_id,
      characterId: prismaUserCharacter.character_id,
      unlockedAt: prismaUserCharacter.unlocked_at,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param {UserCharacter} domainUserCharacter 도메인 Aggregate Root
   * @returns {Prisma.user_charactersCreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(
    domainUserCharacter: UserCharacter,
  ): Prisma.user_charactersUncheckedCreateInput {
    return {
      id: domainUserCharacter.id.toString(),
      user_id: domainUserCharacter.userId,
      character_id: domainUserCharacter.characterId,
      unlocked_at: domainUserCharacter.unlockedAt,
    };
  }
}
