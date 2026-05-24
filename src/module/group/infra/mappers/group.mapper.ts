import { Prisma, groups as GroupPrisma } from '@prisma/client';
import { Group, GroupMember } from '../../domain/models';
import { BoundedString } from '@lib/domain';

export class GroupMapper {
  static toDomain(prismaGroup: GroupPrisma, members: GroupMember[]): Group {
    return Group.unsafeCreate({
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

  static toPersistence(domainGroup: Group): Prisma.groupsUncheckedCreateInput {
    return {
      id: domainGroup.id.toString(),
      owner_id: domainGroup.ownerId,
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
