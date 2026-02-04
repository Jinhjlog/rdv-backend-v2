import { Injectable } from '@nestjs/common';
import { CharacterRepository } from '../../domain/repositories';
import { Character } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { CharacterMapper } from '../mappers';

@Injectable()
export class CharacterRepositoryImpl implements CharacterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: Character): Promise<void> {
    const raw = CharacterMapper.toPersistence(entity);

    await this.prisma.characters.upsert({
      where: { id: raw.id },
      create: raw,
      update: raw,
    });
  }

  async findById(id: string): Promise<Character | undefined> {
    const raw = await this.prisma.characters.findUnique({ where: { id } });
    if (!raw) {
      return undefined;
    }

    return CharacterMapper.toDomain(raw);
  }

  async findIdByCode(code: string): Promise<string | undefined> {
    const raw = await this.prisma.characters.findUnique({
      where: { character_code: code },
    });
    if (!raw) {
      return undefined;
    }

    return raw.id;
  }

  async findByEventType(eventType: string): Promise<Character[]> {
    const results = await this.prisma.characters.findMany({
      where: {
        unlock_condition: {
          path: ['eventType'],
          equals: eventType,
        },
      },
    });

    return results.map((raw) => CharacterMapper.toDomain(raw));
  }
}
