import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { UnlockConditionResolver } from '../../domain/services';

/**
 * 채팅 횟수 기반 언락 조건 리졸버
 *
 * 서버에서 직접 chat_messages 테이블을 조회하여
 * 사용자의 채팅 횟수를 반환합니다.
 */
@Injectable()
export class ChatCountResolver implements UnlockConditionResolver {
  readonly eventType = 'CHAT_COUNT';

  constructor(private readonly prisma: PrismaService) {}

  async resolve(userId: string): Promise<Record<string, unknown>> {
    const count = await this.prisma.chat_messages.count({
      where: { sender_id: userId },
    });

    return { count };
  }
}
