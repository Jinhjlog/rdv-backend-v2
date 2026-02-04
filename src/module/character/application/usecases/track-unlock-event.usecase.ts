import { Inject, Injectable } from '@nestjs/common';
import {
  CharacterRepository,
  UserCharacterRepository,
} from '../../domain/repositories';
import { UserCharacter } from '../../domain/models';
import {
  UnlockConditionMatcher,
  UnlockConditionResolver,
  UNLOCK_CONDITION_RESOLVER,
} from '../../domain/services';
import {
  TrackUnlockEventDto,
  TrackUnlockEventResultDto,
  UnlockedCharacterInfo,
} from '../dtos';

/**
 * 언락 이벤트 트래킹 UseCase
 *
 * 클라이언트로부터 이벤트를 받아 언락 조건을 확인하고 캐릭터를 지급합니다.
 * 서버 검증 리졸버가 등록된 eventType은 서버에서 직접 데이터를 조회합니다.
 */
@Injectable()
export class TrackUnlockEventUseCase {
  private readonly resolverMap: Map<string, UnlockConditionResolver>;

  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly userCharacterRepository: UserCharacterRepository,
    @Inject(UNLOCK_CONDITION_RESOLVER)
    resolvers: UnlockConditionResolver[] = [],
  ) {
    this.resolverMap = new Map(
      resolvers.map((resolver) => [resolver.eventType, resolver]),
    );
  }

  async execute(dto: TrackUnlockEventDto): Promise<TrackUnlockEventResultDto> {
    const { userId, eventType, payload } = dto;

    const resolver = this.resolverMap.get(eventType);
    const resolvedPayload = resolver
      ? await resolver.resolve(userId)
      : (payload ?? {});

    const characters =
      await this.characterRepository.findByEventType(eventType);

    const unlockedCharacters: UnlockedCharacterInfo[] = [];

    for (const character of characters) {
      if (
        !character.unlockCondition ||
        !UnlockConditionMatcher.matches(
          character.unlockCondition,
          resolvedPayload,
        )
      ) {
        continue;
      }

      const characterId = character.id.toString();
      const isOwned = await this.userCharacterRepository.exists(
        userId,
        characterId,
      );
      if (isOwned) {
        continue;
      }

      const userCharacter = UserCharacter.create({
        userId,
        characterId,
      });
      userCharacter.unlock(character.name, character.characterCode);
      await this.userCharacterRepository.save(userCharacter);

      unlockedCharacters.push({
        characterCode: character.characterCode,
        name: character.name,
        description: character.description,
      });
    }

    return { unlockedCharacters };
  }
}
