import { LocationTrackingQueryModel } from '../models';

export interface FindLocationsByEventParams {
  eventId: string;
}

/**
 * LocationTracking Query Repository 인터페이스
 *
 * 위치 추적 정보 조회 전용 레포지토리
 */
export abstract class LocationTrackingQueryRepository {
  /**
   * 일정별 참여자 위치 목록 조회
   *
   * 해당 일정의 모든 위치 추적 정보를 반환
   * updated_at 기준 최신순 정렬
   */
  abstract findByEventId(
    params: FindLocationsByEventParams,
  ): Promise<LocationTrackingQueryModel[]>;
}
