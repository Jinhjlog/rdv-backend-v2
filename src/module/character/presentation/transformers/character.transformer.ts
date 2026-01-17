import { CharacterListItemQueryModel } from '../../domain/models';
import { CharacterListResponseDto } from '../dtos/response';

export class CharacterTransformer {
  /**
   * QueryModel 배열을 ListResponseDto로 변환합니다
   */
  static toListResponse(
    queryModels: CharacterListItemQueryModel[],
  ): CharacterListResponseDto {
    return {
      characters: queryModels.map((model) => ({
        id: model.id,
        characterCode: model.characterCode,
        name: model.name,
        description: model.description,
        isDefault: model.isDefault,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      })),
    };
  }
}
