/** 위치 추적 조회 ReadModel */
export interface LocationTrackingReadModel {
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  latitude?: string;
  longitude?: string;
  lastUpdatedAt?: Date;
}
