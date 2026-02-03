import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CharacterQueryRepository,
  FindCharacterDetailParams,
} from '../../domain/repositories';
import {
  CharacterListItemQueryModel,
  CharacterListItemWithOwnershipQueryModel,
  CharacterDetailQueryModel,
  UnlockCondition,
} from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import { PrismaJsonUtil } from '@core/database/prisma-json.util';

@Injectable()
export class CharacterQueryRepositoryImpl implements CharacterQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 목록을 조회합니다.
   *
   * @returns 목록
   */
  async findList(): Promise<CharacterListItemQueryModel[]> {
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
      unlockHint: result.unlock_hint ?? undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }));
  }

  /**
   * 보유 여부 포함 목록을 조회합니다.
   *
   * @param userId 사용자 ID
   * @returns 보유 여부 포함 목록
   */
  async findListWithOwnership(
    userId: string,
  ): Promise<CharacterListItemWithOwnershipQueryModel[]> {
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
      unlockHint: char.unlock_hint ?? undefined,
      createdAt: char.created_at,
      updatedAt: char.updated_at,
      isOwned: char.user_characters.length > 0,
    }));
  }

  /**
   * ID로 상세 정보를 조회합니다.
   *
   * @param id 엔티티 ID
   * @returns 상세 정보 또는 null
   */
  async findDetail(
    params: FindCharacterDetailParams,
  ): Promise<CharacterDetailQueryModel | undefined> {
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
      unlockHint: result.unlock_hint ?? undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  /**
   * 사용자가 트래킹해야 할 이벤트 타입 목록을 조회합니다.
   *
   * @param userId 사용자 ID
   * @returns 중복 제거된 트래킹 가능한 이벤트 타입 목록
   */
  async getTrackableEventTypes(userId: string): Promise<string[]> {
    // 언락 조건이 있고 아직 보유하지 않은 캐릭터 조회
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

    // eventType 추출 및 중복 제거
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
