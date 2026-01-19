import { Character } from '../models';

export abstract class CharacterRepository {
  abstract save(entity: Character): Promise<void>;
  abstract findById(id: string): Promise<Character | undefined>;
  abstract findIdByCode(code: string): Promise<string | undefined>;
}
