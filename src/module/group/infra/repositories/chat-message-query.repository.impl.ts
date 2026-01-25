import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import {
  ChatMessageQueryRepository,
  FindChatMessageListParams,
} from '../../domain/repositories/chat-message-query.repository';
import { ChatMessageQueryModel } from '../../domain/models/chat-message/chat-message.query-model';

@Injectable()
export class ChatMessageQueryRepositoryImpl implements ChatMessageQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findList(
    params: FindChatMessageListParams,
  ): Promise<ChatMessageQueryModel[]> {
    const messages = await this.prisma.chat_messages.findMany({
      where: {
        group_id: params.groupId,
        // 커서 기반 필터링 (createdAt + id tie-breaker) - 과거 방향
        ...(params.cursor && {
          OR: [
            // createdAt이 커서보다 이전인 경우
            {
              created_at: {
                lt: new Date(params.cursor.createdAt),
              },
            },
            // createdAt이 같으면 id로 비교
            {
              created_at: new Date(params.cursor.createdAt),
              id: {
                lt: params.cursor.id,
              },
            },
          ],
        }),
        // sinceId 기반 필터링 - 미래 방향 (해당 ID 이후 메시지)
        ...(params.sinceId && {
          id: {
            gt: params.sinceId,
          },
        }),
      },
      include: {
        users: {
          select: {
            id: true,
            nickname: true,
            name_tag: true,
            character_code: true,
            preferred_theme_color: true,
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: params.limit,
    });

    return messages.map((message) => ({
      id: message.id,
      groupId: message.group_id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      sender: {
        id: message.users.id,
        nickname: message.users.nickname,
        nameTag: message.users.name_tag,
        characterCode: message.users.character_code,
        preferredThemeColor: message.users.preferred_theme_color,
      },
    }));
  }
}
