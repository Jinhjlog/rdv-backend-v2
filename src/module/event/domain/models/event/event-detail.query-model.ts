interface EventParticipantQueryModel {
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
}

/**
 * Event 상세 조회 메인 Query Model
 */
export interface EventDetailQueryModel {
  // 공통 필드 (모든 상태)
  id: string;
  groupId: string;
  createdBy: {
    userId: string;
    nickname: string;
    nameTag: string;
    characterCode: string;
    preferredThemeColor: string;
  };
  title: string;
  description: string;
  eventTime: Date;
  trackingStartTime: Date;
  endTime: Date;
  locationAddress: string;
  locationDetail: string;
  locationLatitude: string;
  locationLongitude: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  participants: EventParticipantQueryModel[];
}
