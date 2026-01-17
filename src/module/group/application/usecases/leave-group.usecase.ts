import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';
import { LeaveGroupDto } from '../dtos';

@Injectable()
export class LeaveGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

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

    // 2. 도메인 메서드로 탈퇴 처리
    group.leaveGroup(dto.userId);

    // 3. 저장
    await this.groupRepository.save(group);
  }
}
