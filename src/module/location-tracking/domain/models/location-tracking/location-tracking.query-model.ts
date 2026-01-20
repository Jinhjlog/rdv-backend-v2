/**
 * 위치 추적 조회 모델
 *
 * 일정별 참여자 위치 목록 조회 시 사용되는 쿼리 모델
 */
export interface LocationTrackingQueryModel {
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  latitude?: string;
  longitude?: string;
  lastUpdatedAt?: Date;
}
