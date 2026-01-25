import {
  EventListItemQueryModel,
  EventDetailQueryModel,
  ActiveEventQueryModel,
  CalendarEventListItemQueryModel,
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

export interface FindCalendarEventListParams {
  userId: string;
  date: string; // YYYY-MM-DD 형식
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

  /**
   * 특정 날짜의 사용자 소속 모임 일정 목록을 조회합니다.
   * 캘린더에서 날짜 선택 시 해당 날짜의 일정 목록 표시용.
   */
  abstract findCalendarEventList(
    params: FindCalendarEventListParams,
  ): Promise<CalendarEventListItemQueryModel[]>;
}
