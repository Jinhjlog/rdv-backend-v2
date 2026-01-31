import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import { GroupLeavePolicyService } from '../../domain/services';
import { EntityNotFoundException } from '@shared/exception';
import { LeaveGroupDto } from '../dtos';

@Injectable()
export class LeaveGroupUseCase {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupLeavePolicyService: GroupLeavePolicyService,
  ) {}

  async execute(dto: LeaveGroupDto): Promise<void> {
    // 1. 그룹 조회
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group) {
      throw new EntityNotFoundException({
        entityName: 'Group',
        errorCode: 'GROUP_NOT_FOUND',
        id: dto.groupId,
      });
    }

    // 2. 이벤트 관련 탈퇴 조건 검증
    await this.groupLeavePolicyService.validateLeaveConstraints(
      dto.userId,
      dto.groupId,
    );

    // 3. 철회 가능한 모집중 일정에서 자동 철회
    await this.groupLeavePolicyService.withdrawFromRecruitingEvents(
      dto.userId,
      dto.groupId,
    );

    // 4. 도메인 메서드로 탈퇴 처리
    group.leaveGroup(dto.userId);

    // 5. 저장
    await this.groupRepository.save(group);
  }
}
