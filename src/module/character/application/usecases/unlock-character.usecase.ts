import { Injectable } from '@nestjs/common';
import {
  CharacterRepository,
  UserCharacterRepository,
} from '../../domain/repositories';
import { UserLookupService } from '../../domain/services';
import { UserCharacter } from '../../domain/models';
import { UnlockCharacterDto } from '../dtos';
import {
  DomainRuleViolationException,
  EntityNotFoundException,
} from '@shared/exception';

/**
 * 캐릭터 언록 UseCase
 *
 * 사용자가 특정 캐릭터 코드로 캐릭터를 언록합니다.
 */
@Injectable()
export class UnlockCharacterUseCase {
  constructor(
    private readonly userCharacterRepository: UserCharacterRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly userLookupService: UserLookupService,
  ) {}

  /**
   * 캐릭터를 언록합니다
   *
   * @param dto 언록 요청 데이터 (userId, characterId)
   * @throws {UserNotFoundError} 사용자를 찾을 수 없음
   * @throws {CharacterNotFoundError} 캐릭터를 찾을 수 없음
   * @throws {CharacterAlreadyUnlockedError} 이미 언록한 캐릭터
   */
  async execute(dto: UnlockCharacterDto): Promise<void> {
    const { userId, characterId } = dto;

    // 1. 사용자 존재 확인
    const existsUser = await this.userLookupService.existsById(userId);
    if (!existsUser) {
      throw new EntityNotFoundException({
        entityName: 'User',
        errorCode: 'USER_NOT_FOUND',
        id: userId,
      });
    }

    // 2. 캐릭터 조회
    const character = await this.characterRepository.findById(characterId);
    if (!character) {
      throw new EntityNotFoundException({
        entityName: 'Character',
        errorCode: 'CHARACTER_NOT_FOUND',
        id: characterId,
      });
    }

    // 3. 이미 언록한 캐릭터인지 확인
    const existing =
      await this.userCharacterRepository.findByUserIdAndCharacterId(
        userId,
        characterId,
      );
    if (existing) {
      throw new DomainRuleViolationException({
        entityName: 'UserCharacter',
        reason: '이미 보유 중인 캐릭터는 잠금 해제할 수 없습니다.',
        errorCode: 'CHARACTER_ALREADY_UNLOCKED',
      });
    }

    // 4. UserCharacter Aggregate 생성
    const userCharacter = UserCharacter.create({ userId, characterId });

    // 5. 저장
    await this.userCharacterRepository.save(userCharacter);
  }
}
