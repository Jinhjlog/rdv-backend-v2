import { EventListItemQueryModel, EventDetailQueryModel } from '../models';

export interface FindEventListParams {
  /**
   * contextUserId를 전달할 경우, 해당 사용자가 소속된 그룹에 한정하여 조회합니다.
   */
  contextUserId?: string;
  groupId?: string;
  status?: string;
}

export interface FindEventDetailParams {
  eventId: string;
  /**
   * contextUserId를 전달할 경우, 해당 사용자가 소속된 그룹에 한정하여 조회합니다.
   */
  contextUserId?: string;
}

export abstract class EventQueryRepository {
  abstract findList(
    params: FindEventListParams,
  ): Promise<EventListItemQueryModel[]>;

  abstract findDetail(
    params: FindEventDetailParams,
  ): Promise<EventDetailQueryModel | undefined>;
}
