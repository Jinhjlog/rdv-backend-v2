import { Injectable } from '@nestjs/common';
import {
  GroupRepository,
  InviteCodeRepository,
} from '../../domain/repositories';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';
import { InviteAccessCode, InviteCode } from '../../domain';
import { CreateInviteCodeDto } from '../dtos';

@Injectable()
export class CreateInviteCodeUseCase {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly inviteCodeRepository: InviteCodeRepository,
  ) {}

  async execute(dto: CreateInviteCodeDto): Promise<{
    code: string;
    expiresAt: Date;
  }> {
    const group = await this.groupRepository.findById(dto.groupId);
    if (!group) {
      throw new EntityNotFoundException({
        entityName: 'Group',
        errorCode: 'GROUP_NOT_FOUND',
        id: dto.groupId,
      });
    }

    if (!group.hasMember(dto.userId)) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        errorCode: 'GROUP_MEMBER_ONLY',
        reason: '모임 참여자만 초대 코드를 생성할 수 있습니다.',
      });
    }

    const code = await InviteAccessCode.createUnique(
      async (code: string) =>
        await this.inviteCodeRepository.existsByCode(code),
    );

    const inviteCode = InviteCode.create({
      groupId: dto.groupId,
      code,
      createdBy: dto.userId,
    });

    await this.inviteCodeRepository.save(inviteCode);

    return { code: inviteCode.code.value, expiresAt: inviteCode.expiresAt };
  }
}
