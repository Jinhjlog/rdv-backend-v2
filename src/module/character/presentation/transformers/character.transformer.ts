import { CharacterListWithOwnershipReadModel } from '../../domain/models';
import { CharacterListResponseDto } from '../dtos/response';

export class CharacterTransformer {
  static toListResponse(
    readModels: CharacterListWithOwnershipReadModel[],
  ): CharacterListResponseDto {
    return {
      characters: readModels.map((model) => ({
        id: model.id,
        characterCode: model.characterCode,
        name: model.name,
        description: model.description,
        isDefault: model.isDefault,
        unlockHint: model.unlockHint ?? null,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        isOwned: model.isOwned,
      })),
    };
  }
}
