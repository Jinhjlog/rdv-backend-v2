/**
 * 일정 모듈에서 사용하는 큐 관련 상수
 */
export const EVENT_QUEUE = {
  /**
   * 일정 큐 이름
   */
  NAME: 'event-schedule',

  /**
   * 일정 작업 유형
   */
  JOBS: {
    // 참여자 체크 [위치 공유 5분 전]
    PARTICIPANT_CHECK: 'event-schedule-participant-check',

    // 위치 공유 시작
    LOCATION_SHARING_START: 'event-schedule-location-sharing-start',

    // 일정 종료
    END: 'event-schedule-end',
  },
} as const;

// typeof를 사용한 타입 추출 (권장)
export type EventQueueType = typeof EVENT_QUEUE;
export type EventJobType = (typeof EVENT_QUEUE)['JOBS'];
export type EventJobName =
  (typeof EVENT_QUEUE)['JOBS'][keyof (typeof EVENT_QUEUE)['JOBS']];
