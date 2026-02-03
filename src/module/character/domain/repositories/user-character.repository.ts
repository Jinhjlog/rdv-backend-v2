import { UserCharacter } from '../models';

export abstract class UserCharacterRepository {
  abstract save(entity: UserCharacter): Promise<void>;
  abstract findByUserIdAndCharacterId(
    userId: string,
    characterId: string,
  ): Promise<UserCharacter | undefined>;
  abstract exists(userId: string, characterId: string): Promise<boolean>;
}
