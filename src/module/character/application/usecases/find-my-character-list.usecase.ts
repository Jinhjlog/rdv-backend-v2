import { Injectable } from '@nestjs/common';
import { CharacterQueryRepository } from '../../domain/repositories';
import { CharacterListItemQueryModel } from '../../domain/models';
import { FindMyCharacterListDto } from '../dtos';

/**
 * 내 보유 캐릭터 목록 조회 UseCase
 *
 * 현재 로그인한 사용자가 보유한 캐릭터 목록을 조회합니다.
 */
@Injectable()
export class FindMyCharacterListUseCase {
  constructor(
    private readonly characterQueryRepository: CharacterQueryRepository,
  ) {}

  /**
   * 내 보유 캐릭터 목록을 조회합니다
   *
   * @param userId 사용자 ID
   * @returns 보유한 캐릭터 목록
   */
  async execute(
    dto: FindMyCharacterListDto,
  ): Promise<CharacterListItemQueryModel[]> {
    // 1. 보유한 캐릭터 목록 조회
    const characters = await this.characterQueryRepository.findMyCharacterList(
      dto.userId,
    );

    return characters;
  }
}
