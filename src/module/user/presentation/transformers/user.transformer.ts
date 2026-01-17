import { UserQueryModel } from '../../domain/models';
import { UserResponseDto } from '../dtos';

export class UserTransformer {
  /**
   * QueryModel과 멤버 목록을 DetailResponseDto로 변환합니다
   */
  static toDetailResponse(queryModel: UserQueryModel): UserResponseDto {
    return {
      id: queryModel.id,
      nickname: queryModel.nickname,
      nameTag: queryModel.nameTag,
      preferredThemeColor: queryModel.preferredThemeColor,
      characterCode: queryModel.characterCode,
      level: queryModel.level,
      experience: queryModel.experience,
    };
  }
}
