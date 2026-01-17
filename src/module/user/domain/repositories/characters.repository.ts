export abstract class CharactersRepository {
  abstract findDefaultCharacterCode(): Promise<string>;
}
