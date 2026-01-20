import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ChatMessageRepository } from '../../domain/repositories/chat-message.repository';
import { ChatMessage } from '../../domain/models/chat-message/chat-message';
import { ChatMessageMapper } from '../mappers/chat-message.mapper';

@Injectable()
export class ChatMessageRepositoryImpl implements ChatMessageRepository {
  private static readonly DEFAULT_LIMIT = 30;

  constructor(private readonly prisma: PrismaService) {}

  async save(chatMessage: ChatMessage): Promise<void> {
    const data = ChatMessageMapper.toPersistence(chatMessage);

    await this.prisma.chat_messages.create({
      data,
    });
  }

  async findByGroupId(
    groupId: string,
    cursor?: string,
    limit: number = ChatMessageRepositoryImpl.DEFAULT_LIMIT,
  ): Promise<ChatMessage[]> {
    // 커서가 있으면 해당 메시지의 createdAt을 기준으로 조회
    let cursorDate: Date | undefined;

    if (cursor) {
      const cursorMessage = await this.prisma.chat_messages.findUnique({
        where: { id: cursor },
        select: { created_at: true },
      });
      cursorDate = cursorMessage?.created_at;
    }

    const messages = await this.prisma.chat_messages.findMany({
      where: {
        group_id: groupId,
        ...(cursorDate && {
          created_at: { lt: cursorDate },
        }),
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return messages.map((message) => ChatMessageMapper.toDomain(message));
  }

  async findById(id: string): Promise<ChatMessage | undefined> {
    const message = await this.prisma.chat_messages.findUnique({
      where: { id },
    });

    if (!message) {
      return undefined;
    }

    return ChatMessageMapper.toDomain(message);
  }
}
