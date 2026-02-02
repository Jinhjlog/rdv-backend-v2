import { Injectable } from '@nestjs/common';
import {
  CharacterQueryRepository,
  FindCharacterDetailParams,
} from '../../domain/repositories';
import {
  CharacterListItemQueryModel,
  CharacterListItemWithOwnershipQueryModel,
  CharacterDetailQueryModel,
} from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';

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
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
}
