/** 마지막 종료 일정 ReadModel */
export interface LastEndedEventReadModel {
  eventTime: Date;
  locationDetail: string;
}

/** 모임 목록 조회용 ReadModel */
export interface GroupListReadModel {
  id: string;
  name: string;
  description: string;
  iconCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  lastEndedEvent?: LastEndedEventReadModel;
}

/** 모임 상세 조회용 ReadModel */
export interface GroupDetailReadModel {
  id: string;
  name: string;
  description: string;
  iconCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMemberReadModel[];
}

/** 모임 멤버 ReadModel */
export interface GroupMemberReadModel {
  id: string;
  groupId: string;
  userId: string;
  nickname: string;
  nameTag: string;
  preferredThemeColor: string;
  characterCode: string;
  role: string; // 'OWNER' | 'MEMBER'
  joinedAt: Date;
}
