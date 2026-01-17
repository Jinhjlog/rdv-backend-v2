import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';

export class DeleteGroupDto {
  groupId: string;
  userId: string;
}

@Injectable()
export class DeleteGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(dto: DeleteGroupDto): Promise<void> {
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
        reason: '모임장만 모임을 삭제할 수 있습니다.',
      });
    }

    // 3. 삭제 가능 여부 체크 (다른 멤버가 없어야 함)
    if (!group.canBeDeleted()) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        errorCode: 'GROUP_HAS_OTHER_MEMBERS',
        reason: '다른 참여자가 있는 모임은 삭제할 수 없습니다.',
      });
    }

    // 4. 삭제
    await this.groupRepository.delete(dto.groupId);
  }
}
