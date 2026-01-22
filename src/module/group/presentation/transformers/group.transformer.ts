import {
  GroupDetailQueryModel,
  GroupListItemQueryModel,
} from '../../domain/models';
import { GroupDetailResponseDto, GroupListResponseDto } from '../dtos/response';

export class GroupTransformer {
  /**
   * QueryModel 배열을 ListResponseDto로 변환합니다
   */
  static toListResponse(
    queryModels: GroupListItemQueryModel[],
  ): GroupListResponseDto {
    return {
      items: queryModels.map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        iconCode: model.iconCode,
        ownerId: model.ownerId,
        memberCount: model.memberCount,
        maxMembers: model.maxMembers,
        isPublic: model.isPublic,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        lastEndedEvent: model.lastEndedEvent
          ? {
              eventTime: model.lastEndedEvent.eventTime,
              locationDetail: model.lastEndedEvent.locationDetail,
            }
          : null,
      })),
    };
  }

  /**
   * QueryModel과 멤버 목록을 DetailResponseDto로 변환합니다
   */
  static toDetailResponse(
    queryModel: GroupDetailQueryModel,
  ): GroupDetailResponseDto {
    return {
      id: queryModel.id,
      name: queryModel.name,
      description: queryModel.description,
      iconCode: queryModel.iconCode,
      ownerId: queryModel.ownerId,
      maxMembers: queryModel.maxMembers,
      isPublic: queryModel.isPublic,
      createdAt: queryModel.createdAt,
      updatedAt: queryModel.updatedAt,
      members: queryModel.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        invitedBy: member.invitedBy !== undefined ? member.invitedBy : null,
        joinedAt: member.joinedAt,
      })),
    };
  }
}
