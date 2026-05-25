/** 일정 존재 및 그룹 멤버십 확인 서비스 (LookupService) */
export abstract class EventLookupService {
  /** 해당 ID의 진행중 일정이 존재하는지 확인합니다. */
  abstract existsByStatusInProgress(eventId: string): Promise<boolean>;

  /** 해당 사용자가 이벤트가 속한 그룹의 멤버인지 확인합니다. */
  abstract isGroupMemberOfEvent(
    eventId: string,
    userId: string,
  ): Promise<boolean>;

  /** 해당 일정의 약속 시간을 조회합니다. */
  abstract findEventTimeById(eventId: string): Promise<Date | undefined>;
}
