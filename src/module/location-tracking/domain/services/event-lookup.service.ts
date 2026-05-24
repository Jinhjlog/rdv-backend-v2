/** 일정 존재 확인 서비스 (LookupService) */
export abstract class EventLookupService {
  /** 해당 ID의 진행중 일정이 존재하는지 확인합니다. */
  abstract existsByStatusInProgress(eventId: string): Promise<boolean>;
}
