import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CharacterQueryService,
  FindCharacterDetailParams,
} from '../../domain/services';
import {
  CharacterListReadModel,
  CharacterListWithOwnershipReadModel,
  CharacterDetailReadModel,
  UnlockCondition,
} from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { PrismaJsonUtil } from '@core/database/prisma-json.util';

@Injectable()
export class CharacterQueryServiceImpl implements CharacterQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findList(): Promise<CharacterListReadModel[]> {
    const results = await this.prisma.characters.findMany({
      select: {
        id: true,
        character_code: true,
        name: true,
        description: true,
        is_default: true,
        unlock_hint: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return results.map((result) => ({
      id: result.id,
      characterCode: result.character_code,
      name: result.name,
      description: result.description,
      isDefault: result.is_default,
      unlockHint: result.unlock_hint !== null ? result.unlock_hint : undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }));
  }

  async findListWithOwnership(
    userId: string,
  ): Promise<CharacterListWithOwnershipReadModel[]> {
    const results = await this.prisma.characters.findMany({
      select: {
        id: true,
        character_code: true,
        name: true,
        description: true,
        is_default: true,
        unlock_hint: true,
        created_at: true,
        updated_at: true,
        user_characters: {
          where: { user_id: userId },
          select: { id: true },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return results.map((char) => ({
      id: char.id,
      characterCode: char.character_code,
      name: char.name,
      description: char.description,
      isDefault: char.is_default,
      unlockHint: char.unlock_hint !== null ? char.unlock_hint : undefined,
      createdAt: char.created_at,
      updatedAt: char.updated_at,
      isOwned: char.user_characters.length > 0,
    }));
  }

  async findDetail(
    params: FindCharacterDetailParams,
  ): Promise<CharacterDetailReadModel | undefined> {
    const result = await this.prisma.characters.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        character_code: true,
        name: true,
        description: true,
        is_default: true,
        unlock_hint: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!result) {
      return undefined;
    }

    return {
      id: result.id,
      characterCode: result.character_code,
      name: result.name,
      description: result.description,
      isDefault: result.is_default,
      unlockHint: result.unlock_hint !== null ? result.unlock_hint : undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  async getTrackableEventTypes(userId: string): Promise<string[]> {
    const characters = await this.prisma.characters.findMany({
      where: {
        unlock_condition: { not: Prisma.DbNull },
        user_characters: {
          none: { user_id: userId },
        },
      },
      select: {
        unlock_condition: true,
      },
    });

    const eventTypes = new Set<string>();
    for (const char of characters) {
      const condition = PrismaJsonUtil.deserialize<UnlockCondition>(
        char.unlock_condition,
      );
      eventTypes.add(condition.eventType);
    }

    return Array.from(eventTypes);
  }
}
