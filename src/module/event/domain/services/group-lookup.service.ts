/** 모임 존재/정보 확인 서비스 (LookupService) */
export abstract class GroupLookupService {
  /** 해당 ID의 모임이 존재하는지 확인합니다. */
  abstract exists(groupId: string): Promise<boolean>;

  /** 모임의 멤버 사용자 ID 목록을 조회합니다. */
  abstract findMemberUserIds(groupId: string): Promise<string[]>;

  /** 모임 이름을 조회합니다. */
  abstract findGroupNameById(groupId: string): Promise<string>;
}
