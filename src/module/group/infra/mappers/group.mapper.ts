import { Prisma, groups as GroupPrisma } from '@prisma/client';
import { Group, GroupMember } from '../../domain/models';
import { BoundedString } from '@lib/domain';

/**
 * GroupMapper
 *
 * 영속성 계층의 Group을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class GroupMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param {GroupPrisma} prismaGroup Prisma 모델
   * @returns {Group} 도메인 Aggregate Root
   */
  static toDomain(prismaGroup: GroupPrisma, members: GroupMember[]): Group {
    return new Group({
      id: prismaGroup.id,
      name: BoundedString.unsafeCreate(prismaGroup.name),
      description: BoundedString.unsafeCreate(prismaGroup.description),
      iconCode: prismaGroup.icon_code,
      ownerId: prismaGroup.owner_id,
      maxMembers: prismaGroup.max_members,
      isPublic: prismaGroup.is_public,
      createdAt: prismaGroup.created_at,
      updatedAt: prismaGroup.updated_at,
      members,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param {Group} domainGroup 도메인 Aggregate Root
   * @returns {Prisma.groupsCreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(domainGroup: Group): Prisma.groupsCreateInput {
    return {
      users: { connect: { id: domainGroup.ownerId } },
      id: domainGroup.id.toString(),
      name: domainGroup.name.value,
      description: domainGroup.description.value,
      icon_code: domainGroup.iconCode,
      max_members: domainGroup.maxMembers,
      is_public: domainGroup.isPublic,
      created_at: domainGroup.createdAt,
      updated_at: domainGroup.updatedAt,
    };
  }
}
