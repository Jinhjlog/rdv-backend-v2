/**
 * Group 목록/상세 조회용 쿼리 모델
 *
 * - 설명: 사용자가 속한 그룹 목록 및 상세 정보 조회
 * - 사용자: 인증된 사용자
 */
export interface GroupListItemQueryModel {
  id: string;
  name: string;
  description: string;
  iconCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupDetailQueryModel {
  id: string;
  name: string;
  description: string;
  iconCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMemberQueryModel[];
}

/**
 * GroupMember 조회용 쿼리 모델
 *
 * - 설명: 그룹 멤버 목록 조회
 * - 사용자: 그룹 멤버
 */
export interface GroupMemberQueryModel {
  id: string;
  groupId: string;
  userId: string;
  role: string; // 'OWNER' | 'MEMBER'
  invitedBy: string | undefined;
  joinedAt: Date;
}
