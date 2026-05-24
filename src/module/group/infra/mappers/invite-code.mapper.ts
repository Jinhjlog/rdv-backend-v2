import { invite_codes as InviteCodePrisma, Prisma } from '@prisma/client';
import { InviteAccessCode, InviteCode } from '../../domain/models';

/**
 * InviteCodeMapper
 *
 * InviteCode 엔티티와 Prisma 모델 간의 매핑
 */
export class InviteCodeMapper {
  /**
   * Prisma 모델을 도메인 엔티티로 변환합니다
   *
   * @param {InviteCodePrisma} prismaInviteCode Prisma 모델
   * @returns {InviteCode} 도메인 엔티티
   */
  static toDomain(prismaInviteCode: InviteCodePrisma): InviteCode {
    return InviteCode.unsafeCreate({
      id: prismaInviteCode.id,
      groupId: prismaInviteCode.group_id,
      code: InviteAccessCode.unsafeCreate(prismaInviteCode.code),
      createdBy: prismaInviteCode.created_by,
      expiresAt: prismaInviteCode.expires_at,
      isUsed: prismaInviteCode.is_used,
      usedBy: prismaInviteCode.used_by ?? undefined,
      usedAt: prismaInviteCode.used_at ?? undefined,
      createdAt: prismaInviteCode.created_at,
    });
  }

  /**
   * 도메인 엔티티를 Prisma 모델로 변환합니다
   *
   * @param {InviteCode} inviteCode 도메인 엔티티
   * @returns {Prisma.invite_codesCreateInput} Prisma 모델
   */
  static toPersistence(
    inviteCode: InviteCode,
  ): Prisma.invite_codesUncheckedCreateInput {
    return {
      id: inviteCode.id.toString(),
      group_id: inviteCode.groupId,
      code: inviteCode.code.value,
      created_by: inviteCode.createdBy,
      expires_at: inviteCode.expiresAt,
      is_used: inviteCode.isUsed,
      used_by: inviteCode.usedBy !== undefined ? inviteCode.usedBy : null,
      used_at: inviteCode.usedAt !== undefined ? inviteCode.usedAt : null,
      created_at: inviteCode.createdAt,
    };
  }
}
