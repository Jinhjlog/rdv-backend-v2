import { Injectable } from '@nestjs/common';
import { EventSchedulingPort } from '../../application/ports';

/**
 * 일정 스케줄링 Mock Adapter
 *
 * 모든 스케줄링 요청을 no-op으로 처리합니다.
 * E2E 테스트 환경에서 Cloud Tasks/BullMQ 연결 없이 동작합니다.
 */
@Injectable()
export class MockEventSchedulingAdapter implements EventSchedulingPort {
  scheduleParticipantCheck(): Promise<boolean> {
    return Promise.resolve(true);
  }

  cancelParticipantCheck(): Promise<void> {
    return Promise.resolve();
  }

  scheduleLocationSharingStart(): Promise<boolean> {
    return Promise.resolve(true);
  }

  scheduleEventEnd(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
