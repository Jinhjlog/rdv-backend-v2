import { Injectable } from '@nestjs/common';
import { GroupRepository } from '../../domain/repositories';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';
import { TransferOwnershipDto } from '../dtos';

@Injectable()
export class TransferOwnershipUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(dto: TransferOwnershipDto): Promise<void> {
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
        reason: '모임장만 모임장 권한을 이전할 수 있습니다.',
      });
    }

    // 3. 도메인 메서드로 모임장 이전
    group.transferOwnership(dto.newOwnerId);

    // 4. 저장
    await this.groupRepository.save(group);
  }
}
