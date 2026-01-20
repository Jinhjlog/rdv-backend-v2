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
          await this.handleLocationSharingStart(job.data.eventId);
          break;
        case EVENT_QUEUE.JOBS.END:
          await this.handleEventEnd(job.data.eventId);
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

  /**
   * 일정 시작 처리 (위치 공유 시작)
   *
   * Processor → Repository → Domain method → Domain Event 발행
   * - RECRUITING → IN_PROGRESS 상태 전환
   * - EventStartedEvent 발행 → EventHandler에서 일정 종료 스케줄링 예약
   */
  private async handleLocationSharingStart(eventId: string): Promise<void> {
    // 1. 조회
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(`일정을 찾을 수 없음: ${eventId}`);
      return;
    }

    // 2. 상태 확인 (이미 진행중이면 스킵)
    if (!event.canStart()) {
      this.logger.warn(
        `일정을 시작할 수 없는 상태: eventId=${eventId}, status=${event.status}`,
      );
      return;
    }

    // 3. 도메인 메서드 호출 (Domain Event 자동 발행)
    event.start();

    // 4. 저장 (Domain Events 발행됨)
    await this.eventRepository.save(event);

    this.logger.log(
      `일정 시작 완료: eventId=${eventId}, status=${event.status}`,
    );
  }

  /**
   * 일정 종료 처리
   *
   * Processor → Repository → Domain method → Domain Event 발행
   * - IN_PROGRESS → ENDED 상태 전환
   * - 출석 결과 생성 (ARRIVED → 도착, DEPARTED → 지각, PREPARING → 부재)
   * - EventEndedEvent 발행 → EventHandler에서 푸시 알림 발송
   */
  private async handleEventEnd(eventId: string): Promise<void> {
    // 1. 조회
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(`일정을 찾을 수 없음: ${eventId}`);
      return;
    }

    // 2. 상태 확인 (이미 종료됐으면 스킵)
    if (!event.canEnd()) {
      this.logger.warn(
        `일정을 종료할 수 없는 상태: eventId=${eventId}, status=${event.status}`,
      );
      return;
    }

    // 3. 도메인 메서드 호출 (Domain Event 자동 발행 + 출석 결과 생성)
    event.end();

    // 4. 저장 (Domain Events 발행됨)
    await this.eventRepository.save(event);

    this.logger.log(
      `일정 종료 완료: eventId=${eventId}, status=${event.status}`,
    );
  }
}
