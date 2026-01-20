import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { ChatMessageRepository } from '../../domain/repositories/chat-message.repository';
import { ChatMessage } from '../../domain/models/chat-message/chat-message';
import { ChatMessageMapper } from '../mappers/chat-message.mapper';

@Injectable()
export class ChatMessageRepositoryImpl implements ChatMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(chatMessage: ChatMessage): Promise<void> {
    const data = ChatMessageMapper.toPersistence(chatMessage);

    await this.prisma.chat_messages.create({
      data,
    });
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
