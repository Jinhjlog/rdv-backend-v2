export abstract class CharactersRepository {
  abstract findDefaultCharacterCode(): Promise<string>;
  abstract existsUserCharacter(
    userId: string,
    characterCode: string,
  ): Promise<boolean>;
}
