/**
 * 일정 스케줄링 Port
 *
 * 일정 상태 전환 잡(참여자 체크, 위치 공유 시작, 종료)을 예약/취소하기 위한 추상화 계층입니다.
 *
 * - Production: QueueEventSchedulingAdapter (BullMQ / Cloud Tasks)
 * - Test: MockEventSchedulingAdapter (no-op)
 */
export abstract class EventSchedulingPort {
  /** 참여자 체크를 예약합니다. */
  abstract scheduleParticipantCheck(
    eventId: string,
    checkTime: Date,
  ): Promise<boolean>;

  /** 참여자 체크를 취소합니다. */
  abstract cancelParticipantCheck(eventId: string): Promise<void>;

  /** 위치 공유 시작을 예약합니다. */
  abstract scheduleLocationSharingStart(
    eventId: string,
    startTime: Date,
  ): Promise<boolean>;

  /** 일정 종료를 예약합니다. */
  abstract scheduleEventEnd(eventId: string, endTime: Date): Promise<boolean>;
}
