import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from '../dtos';
import { BoundedString } from '@lib/domain';
import { Group, GroupMember, GroupMemberRole } from '../../domain/models';
import { GroupRepository } from '../../domain/repositories';
import { DomainRuleViolationException } from '@shared/exception';

@Injectable()
export class CreateGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(dto: CreateGroupDto): Promise<{ groupId: string }> {
    // 1. 사용자가 이미 모임장인지 확인
    const existingOwner = await this.groupRepository.existsByOwnerId(
      dto.userId,
    );
    if (existingOwner) {
      throw new DomainRuleViolationException({
        entityName: '모임',
        reason: '이미 모임장으로 참여 중인 모임이 있습니다',
        errorCode: 'GROUP_NOT_ALLOWED_MULTIPLE_OWNERSHIP',
      });
    }

    const name = BoundedString.create(dto.name, {
      fieldName: '모임 이름',
      minLength: 1,
      maxLength: 20,
    });

    const description = BoundedString.create(dto.description, {
      fieldName: '모임 소개',
      minLength: 1,
      maxLength: 200,
    });

    const group = Group.create({
      name,
      description,
      iconCode: dto.iconCode,
      ownerId: dto.userId,
      maxMembers: 8,
      isPublic: false,
      members: [],
    });

    const groupMember = GroupMember.create({
      groupId: group.id.toString(),
      userId: dto.userId,
      role: GroupMemberRole.OWNER,
    });

    group.addMember(groupMember);

    await this.groupRepository.save(group);

    return { groupId: group.id.toString() };
  }
}
