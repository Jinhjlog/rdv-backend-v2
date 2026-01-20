import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EVENT_QUEUE } from '../../event.constants';
import { Injectable, Logger } from '@nestjs/common';
import { EventJobData } from '../services';
import { Job } from 'bullmq';
import { EventRepository } from '../../domain/repositories';

@Injectable()
@Processor(EVENT_QUEUE.NAME)
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(private readonly eventRepository: EventRepository) {
    super();
  }

  async process(job: Job<EventJobData>): Promise<void> {
    this.logger.log(
      `Processing job ${job.name} with ID ${job.id} for event ${job.data.eventId}`,
    );

    try {
      switch (job.name) {
        case EVENT_QUEUE.JOBS.PARTICIPANT_CHECK:
          await this.handleParticipantCheck(job.data.eventId);
          break;
        case EVENT_QUEUE.JOBS.LOCATION_SHARING_START:
          // TODO: 위치 공유 시작 로직 구현
          break;
        case EVENT_QUEUE.JOBS.END:
          // TODO: 일정 종료 로직 구현
          break;
      }
    } catch (error) {
      this.logger.error(
        `이벤트 작업 처리 중 오류 발생: jobId=${job.id}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );

      throw error;
    }
  }

  /**
   * 참여자 체크 처리
   *
   * Processor → Repository → Domain method → Domain Event 발행
   * - 2명 이상: ParticipantsCheckPassedEvent 발행 → EventHandler에서 위치 공유 시작 스케줄링 예약
   * - 1명 이하: EventCancelledEvent 발행 → 일정 취소
   */
  private async handleParticipantCheck(eventId: string): Promise<void> {
    // 1. 조회
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(`일정을 찾을 수 없음: ${eventId}`);
      return;
    }

    // 2. 도메인 메서드 호출 (Domain Event 자동 발행)
    const passed = event.checkParticipantsForStart();

    // 3. 저장 (Domain Events 발행됨)
    await this.eventRepository.save(event);

    this.logger.log(
      `참여자 체크 완료: eventId=${eventId}, passed=${passed}, participantCount=${event.participants.length}`,
    );
  }
}
