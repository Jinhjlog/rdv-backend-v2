import {
  EventListItemQueryModel,
  EventDetailQueryModel,
  ActiveEventQueryModel,
} from '../models';

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

export interface FindActiveEventParams {
  groupId: string;
  /**
   * contextUserId를 전달할 경우, 해당 사용자가 소속된 그룹에 한정하여 조회합니다.
   */
  contextUserId?: string;
}

export interface FindCalendarMarkedDatesParams {
  userId: string;
  year: number;
  month: number;
}

export abstract class EventQueryRepository {
  abstract findList(
    params: FindEventListParams,
  ): Promise<EventListItemQueryModel[]>;

  abstract findDetail(
    params: FindEventDetailParams,
  ): Promise<EventDetailQueryModel | undefined>;

  /**
   * 그룹의 진행중인(IN_PROGRESS) 일정을 조회합니다.
   */
  abstract findActiveEventByGroupId(
    params: FindActiveEventParams,
  ): Promise<ActiveEventQueryModel | undefined>;

  /**
   * 사용자가 참여한 일정이 있는 날짜 목록을 조회합니다.
   * 캘린더 마커 표시용.
   */
  abstract findCalendarMarkedDates(
    params: FindCalendarMarkedDatesParams,
  ): Promise<string[]>;
}
