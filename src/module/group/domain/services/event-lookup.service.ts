/** 일정 관련 조회/처리 서비스 (LookupService) */
export abstract class EventLookupService {
  /** 사용자가 해당 그룹의 진행중 일정에 참여 중인지 확인합니다. */
  abstract hasParticipatingInProgressEvent(
    userId: string,
    groupId: string,
  ): Promise<boolean>;

  /** 사용자가 해당 그룹의 참여자 체크 완료된 모집중 일정에 참여 중인지 확인합니다. */
  abstract hasParticipatingRecruitingEventNearCheckTime(
    userId: string,
    groupId: string,
  ): Promise<boolean>;

  /** 사용자가 해당 그룹에서 생성한 활성 일정이 있는지 확인합니다. */
  abstract hasCreatedActiveEvents(
    userId: string,
    groupId: string,
  ): Promise<boolean>;

  /** 사용자가 해당 그룹에서 참여 중인 철회 가능한 일정 ID 목록을 조회합니다. */
  abstract findWithdrawableEventIds(
    userId: string,
    groupId: string,
  ): Promise<string[]>;

  /** 사용자의 일정 참여를 일괄 철회합니다. */
  abstract withdrawFromEvents(
    userId: string,
    eventIds: string[],
  ): Promise<void>;
}
