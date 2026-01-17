import { Injectable } from '@nestjs/common';
import { UpdateGroupDto } from '../dtos';
import { BoundedString } from '@lib/domain';
import { GroupRepository } from '../../domain/repositories';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';

@Injectable()
export class UpdateGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(dto: UpdateGroupDto): Promise<{ groupId: string }> {
    // 1. 그룹 조회
    const group = await this.groupRepository.findById(dto.groupId);

    if (!group) {
      throw new EntityNotFoundException({
        entityName: 'Group',
        errorCode: 'GROUP_NOT_FOUND',
        id: dto.groupId,
      });
    }

    // 2. 모임장 권한 체크
    if (!group.isOwner(dto.userId)) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        errorCode: 'GROUP_OWNER_ONLY',
        reason: '모임장만 모임 정보를 수정할 수 있습니다.',
      });
    }

    // 3. Value Objects 생성 (제공된 필드만)
    const updateData: {
      name?: BoundedString;
      description?: BoundedString;
      iconCode?: string;
    } = {};

    if (dto.name !== undefined) {
      const name = BoundedString.create(dto.name, {
        fieldName: '모임 이름',
        minLength: 2,
        maxLength: 30,
      });
      updateData.name = name;
    }

    if (dto.description !== undefined) {
      const description = BoundedString.create(dto.description, {
        fieldName: '모임 소개',
        minLength: 10,
        maxLength: 500,
      });
      updateData.description = description;
    }

    if (dto.iconCode !== undefined) {
      updateData.iconCode = dto.iconCode;
    }

    // 4. 도메인 메서드 호출
    if (Object.keys(updateData).length > 0) {
      group.updateInfo(updateData);
    }

    // 5. 저장
    await this.groupRepository.save(group);

    // 6. 결과 반환
    return { groupId: group.id.toString() };
  }
}
