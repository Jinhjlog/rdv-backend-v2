import { LocationTracking } from '../models';

/**
 * LocationTracking Repository 인터페이스
 *
 * 조회 최적화 테이블로 UPSERT 및 일정별 조회/삭제 기능 제공
 */
export abstract class LocationTrackingRepository {
  /**
   * 위치 정보 저장 (UPSERT)
   * eventId + userId 조합으로 기존 레코드가 있으면 업데이트, 없으면 생성
   */
  abstract save(entity: LocationTracking): Promise<void>;

  /**
   * ID로 조회
   */
  abstract findById(id: string): Promise<LocationTracking | undefined>;
}
