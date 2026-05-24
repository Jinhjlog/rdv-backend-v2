import { Prisma, public_users as UserPrisma } from '@prisma/client';
import { NameTag, User } from '../../domain/models';
import { BoundedString, PositiveNumber } from '@lib/domain';

/**
 * UserMapper
 *
 * 영속성 계층의 User을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class UserMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param {UserPrisma} prismaUser Prisma 모델
   * @returns {User} 도메인 Aggregate Root
   */

  static toDomain(prismaUser: UserPrisma): User {
    return User.unsafeCreate({
      id: prismaUser.id,
      deviceId: prismaUser.device_id,
      nickname: BoundedString.unsafeCreate(prismaUser.nickname),
      nameTag: NameTag.unsafeCreate(prismaUser.name_tag),
      preferredThemeColor: prismaUser.preferred_theme_color,
      characterCode: prismaUser.character_code,
      level: PositiveNumber.unsafeCreate(prismaUser.level, 'level'),
      experience: PositiveNumber.unsafeCreate(
        prismaUser.experience,
        'experience',
      ),
      createdAt: prismaUser.created_at,
      updatedAt: prismaUser.updated_at,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param {User} domainUser 도메인 Aggregate Root
   * @returns {Prisma.public_usersCreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(domainUser: User): Prisma.public_usersCreateInput {
    return {
      id: domainUser.id.toString(),
      device_id: domainUser.deviceId,
      nickname: domainUser.nickname.value,
      name_tag: domainUser.nameTag.value,
      preferred_theme_color: domainUser.preferredThemeColor,
      character_code: domainUser.characterCode,
      level: domainUser.level.value,
      experience: domainUser.experience.value,
      created_at: domainUser.createdAt,
      updated_at: domainUser.updatedAt,
    };
  }
}
