import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { GroupMembershipLookupService } from '../../domain/services';

/**
 * GroupMembershipLookupServiceImpl
 * - 타 BC 엔티티 존재 확인용 LookupService
 * - Group BC의 멤버십 데이터를 Prisma 직접 쿼리로 조회
 */
@Injectable()
export class GroupMembershipLookupServiceImpl implements GroupMembershipLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.group_members.count({
      where: { group_id: groupId, user_id: userId },
    });
    return count > 0;
  }
}
