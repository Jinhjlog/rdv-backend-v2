import { CharacterListItemWithOwnershipQueryModel } from '../../domain/models';
import { CharacterListResponseDto } from '../dtos/response';

export class CharacterTransformer {
  /**
   * 보유 여부 포함 QueryModel 배열을 ListResponseDto로 변환합니다
   */
  static toListResponse(
    queryModels: CharacterListItemWithOwnershipQueryModel[],
  ): CharacterListResponseDto {
    return {
      characters: queryModels.map((model) => ({
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
