/**
 * Group 모듈에서 Event 관련 조회 및 처리를 위한 Repository
 *
 * Group 모듈에서 Event 데이터에 접근할 때 사용합니다.
 * 순환 의존성 방지를 위해 별도 Repository로 분리합니다.
 */
export abstract class EventRepository {
  /**
   * 사용자가 해당 그룹의 진행중(IN_PROGRESS) 일정에 참여 중인지 확인
   *
   * @param userId 사용자 ID
   * @param groupId 그룹 ID
   * @returns 참여 중인 진행중 일정이 있으면 true
   */
  abstract hasParticipatingInProgressEvent(
    userId: string,
    groupId: string,
  ): Promise<boolean>;

  /**
   * 사용자가 해당 그룹의 참여자 체크가 완료된 모집중 일정에 참여 중인지 확인
   *
   * @param userId 사용자 ID
   * @param groupId 그룹 ID
   * @returns 참여자 체크가 완료된 모집중 일정이 있으면 true
   */
  abstract hasParticipatingRecruitingEventNearCheckTime(
    userId: string,
    groupId: string,
  ): Promise<boolean>;

  /**
   * 사용자가 해당 그룹에서 생성한 활성(RECRUITING/IN_PROGRESS) 일정이 있는지 확인
   *
   * @param userId 사용자 ID
   * @param groupId 그룹 ID
   * @returns 생성한 활성 일정이 있으면 true
   */
  abstract hasCreatedActiveEvents(
    userId: string,
    groupId: string,
  ): Promise<boolean>;

  /**
   * 사용자가 해당 그룹에서 참여 중인 철회 가능한 모집중 일정 ID 목록 조회
   * (참여자 체크 미완료 + 생성자가 아닌 일정)
   *
   * @param userId 사용자 ID
   * @param groupId 그룹 ID
   * @returns 철회 가능한 일정 ID 목록
   */
  abstract findWithdrawableEventIds(
    userId: string,
    groupId: string,
  ): Promise<string[]>;

  /**
   * 사용자의 일정 참여를 일괄 철회
   *
   * @param userId 사용자 ID
   * @param eventIds 철회할 일정 ID 목록
   */
  abstract withdrawFromEvents(
    userId: string,
    eventIds: string[],
  ): Promise<void>;
}
