import {
  EventListReadModel,
  EventDetailReadModel,
  ActiveEventReadModel,
  CalendarEventListReadModel,
  EventResultReadModel,
} from '../models';

export interface FindEventListParams {
  contextUserId?: string;
  groupId?: string;
  status?: string;
}

export interface FindEventDetailParams {
  eventId: string;
  contextUserId?: string;
}

export interface FindActiveEventParams {
  groupId: string;
  contextUserId?: string;
}

export interface FindCalendarMarkedDatesParams {
  userId: string;
  year: number;
  month: number;
}

export interface FindCalendarEventListParams {
  userId: string;
  date: string;
}

export interface FindEventResultParams {
  eventId: string;
  contextUserId?: string;
}

/** 일정 조회용 QueryService */
export abstract class EventQueryService {
  /** 일정 목록을 조회합니다. */
  abstract findList(params: FindEventListParams): Promise<EventListReadModel[]>;

  /** 일정 상세를 조회합니다. */
  abstract findDetail(
    params: FindEventDetailParams,
  ): Promise<EventDetailReadModel | undefined>;

  /** 그룹의 진행중인 일정을 조회합니다. */
  abstract findActiveEventByGroupId(
    params: FindActiveEventParams,
  ): Promise<ActiveEventReadModel | undefined>;

  /** 사용자가 참여한 일정이 있는 날짜 목록을 조회합니다. */
  abstract findCalendarMarkedDates(
    params: FindCalendarMarkedDatesParams,
  ): Promise<string[]>;

  /** 특정 날짜의 사용자 소속 모임 일정 목록을 조회합니다. */
  abstract findCalendarEventList(
    params: FindCalendarEventListParams,
  ): Promise<CalendarEventListReadModel[]>;

  /** 특정 일정의 출석 결과를 조회합니다. */
  abstract findEventResult(
    params: FindEventResultParams,
  ): Promise<EventResultReadModel | undefined>;
}
