/**
 * 모임 멤버십 확인 서비스 (LookupService)
 *
 * Short Talk 컨텍스트에서 Group 컨텍스트의
 * 멤버십 여부를 확인합니다.
 * Infrastructure에서 구현합니다.
 */
export abstract class GroupMembershipLookupService {
  /** 해당 사용자가 그룹의 멤버인지 확인합니다. */
  abstract isMember(groupId: string, userId: string): Promise<boolean>;
}
