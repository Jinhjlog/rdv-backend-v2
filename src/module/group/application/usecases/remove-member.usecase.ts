import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';
import { RemoveMemberDto } from '../dtos';

@Injectable()
export class RemoveMemberUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(dto: RemoveMemberDto): Promise<void> {
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
        reason: '모임장만 참여자를 강퇴할 수 있습니다.',
      });
    }

    // 3. 도메인 메서드로 멤버 제거
    group.removeMember(dto.targetUserId);

    // 4. 저장
    await this.groupRepository.save(group);
  }
}
