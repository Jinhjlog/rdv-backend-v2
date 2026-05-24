/** 일정 참여자 ReadModel */
interface EventParticipantReadModel {
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
  status: string;
}

/** 일정 결과 항목 ReadModel */
export interface EventResultItemReadModel {
  userId: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
  result: string; // 'ARRIVED' | 'LATE' | 'ABSENT'
}

/** 일정 결과 조회 ReadModel */
export interface EventResultReadModel {
  eventId: string;
  groupId: string;
  title: string;
  eventTime: Date;
  locationAddress: string;
  locationDetail: string;
  results: EventResultItemReadModel[];
}

/** 진행중인 일정 조회용 ReadModel */
export interface ActiveEventReadModel {
  id: string;
  groupId: string;
  eventTime: Date;
  trackingStartTime: Date;
  endTime: Date;
}

/** 일정 상세 조회 ReadModel */
export interface EventDetailReadModel {
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
  isParticipantChecked: boolean;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
  participants: EventParticipantReadModel[];
}
