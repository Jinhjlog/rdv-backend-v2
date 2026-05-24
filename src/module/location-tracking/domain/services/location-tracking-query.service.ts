import { LocationTrackingReadModel } from '../models';

export interface FindLocationsByEventParams {
  eventId: string;
}

/** 위치 추적 조회용 QueryService */
export abstract class LocationTrackingQueryService {
  /** 일정별 참여자 위치 목록을 조회합니다. */
  abstract findByEventId(
    params: FindLocationsByEventParams,
  ): Promise<LocationTrackingReadModel[]>;
}
