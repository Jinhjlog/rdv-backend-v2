import { Injectable } from '@nestjs/common';
import {
  GroupRepository,
  InviteCodeRepository,
} from '../../domain/repositories';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';
import { GroupMember, GroupMemberRole } from '../../domain';
import { JoinGroupDto } from '../dtos';
import { InjectUnitOfWork } from '@core/database';
import { IUnitOfWork } from '@lib/domain';

@Injectable()
export class JoinGroupUseCase {
  constructor(
    @InjectUnitOfWork() private readonly uow: IUnitOfWork,
    private readonly groupRepository: GroupRepository,
    private readonly inviteCodeRepository: InviteCodeRepository,
  ) {}

  async execute(dto: JoinGroupDto): Promise<{ groupId: string }> {
    const inviteCode = await this.inviteCodeRepository.findByCode(
      dto.inviteCode,
    );
    if (!inviteCode) {
      throw new EntityNotFoundException({
        entityName: 'InviteCode',
        errorCode: 'INVITE_CODE_NOT_FOUND',
        id: dto.inviteCode,
      });
    }

    if (!inviteCode.isValid()) {
      throw new DomainRuleViolationException({
        entityName: 'InviteCode',
        errorCode: 'INVITE_CODE_EXPIRED',
        reason: '만료된 초대 코드입니다.',
      });
    }

    const group = await this.groupRepository.findById(inviteCode.groupId);
    if (!group) {
      throw new EntityNotFoundException({
        entityName: 'Group',
        errorCode: 'GROUP_NOT_FOUND',
        id: inviteCode.groupId,
      });
    }

    if (group.isFull()) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        errorCode: 'GROUP_MEMBERS_LIMIT_EXCEEDED',
        reason: '모임 인원이 가득 찼습니다.',
      });
    }

    const groupMember = GroupMember.create({
      groupId: group.id.toString(),
      userId: dto.userId,
      role: GroupMemberRole.MEMBER,
      invitedBy: inviteCode.createdBy,
    });

    group.addMember(groupMember);
    inviteCode.markAsUsed(dto.userId);

    await this.uow.execute(async () => {
      await this.groupRepository.save(group);
      await this.inviteCodeRepository.save(inviteCode);
    });

    // 9. 결과 반환
    return { groupId: group.id.toString() };
  }
}
