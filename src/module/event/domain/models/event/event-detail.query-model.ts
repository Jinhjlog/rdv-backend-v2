interface EventParticipantQueryModel {
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
  status: string;
}

/**
 * 일정 결과 항목 Query Model
 */
export interface EventResultItemQueryModel {
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
  result: string; // ARRIVED, LATE, ABSENT
}

/**
 * 일정 결과 조회 Query Model
 */
export interface EventResultQueryModel {
  eventId: string;
  groupId: string;
  title: string;
  eventTime: Date;
  locationAddress: string;
  locationDetail: string;
  results: EventResultItemQueryModel[];
}

/**
 * 진행중인 일정 조회용 간소화된 Query Model
 */
export interface ActiveEventQueryModel {
  id: string;
  groupId: string;
  eventTime: Date;
  trackingStartTime: Date;
  endTime: Date;
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
    level: number;
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
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;

  participants: EventParticipantQueryModel[];
}
