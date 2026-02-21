import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EVENT_QUEUE } from '../../event.constants';
import { Injectable, Logger } from '@nestjs/common';
import { EventJobData } from '../services';
import { Job } from 'bullmq';
import { EventRepository, GroupRepository } from '../../domain/repositories';

@Injectable()
@Processor(EVENT_QUEUE.NAME, {
  /**
   * 큐가 비어있을 때 다음 작업을 기다리는 long polling 시간 (초 단위)
   * - 기본값: 5초 → 시간당 720회, 일일 17,280회 Redis 요청 발생
   * - 300초 설정 시: 시간당 12회, 일일 약 288회로 감소 (약 98% 감소)
   * - Upstash 무료 티어(일일 10,000 요청)에서 비용 최적화를 위해 증가
   */
  drainDelay: 300,

  /**
   * Stalled Job 체크 비활성화 (stalledInterval: 0과 함께 사용)
   *
   * [Stalled Job이란?]
   * - 워커가 작업을 가져갔지만 처리 완료하지 못하고 멈춘 상태
   * - 원인: 워커 크래시, CPU 과부하, 메모리 부족, 네트워크 끊김
   * - BullMQ는 주기적으로 이런 작업을 감지하여 다시 큐에 넣음
   *
   * [비활성화 사유]
   * - 단일 워커 환경: 다른 워커가 stalled 작업을 가져갈 일 없음
   * - 작업이 단순하고 빠름: 크래시 가능성 낮음
   * - 일일 약 2,880회 Redis 요청 절감 (stalledInterval 60초 기준)
   *
   * [주의사항]
   * - 멀티 워커 환경에서는 절대 비활성화 금지
   * - 작업 실패 시 자동 복구 안 됨 → 수동 모니터링 필요
   */
  skipStalledCheck: true,

  /**
   * Lock 갱신 비활성화
   *
   * [Lock이란?]
   * - 워커가 작업 처리 중 다른 워커가 같은 작업을 가져가지 못하도록 잠금
   * - 기본적으로 lockDuration(30초)의 절반인 15초마다 갱신
   * - 갱신마다 Redis 요청 발생
   *
   * [비활성화 사유]
   * - 단일 워커 환경: 락 경쟁 없음
   * - lockDuration을 충분히 길게 설정하면 갱신 불필요
   * - 일일 약 5,760회 Redis 요청 절감 (15초 갱신 기준)
   *
   * [주의사항]
   * - lockDuration 내에 작업이 완료되어야 함
   * - 초과 시 작업이 stalled로 판정될 수 있음 (단, skipStalledCheck로 무시됨)
   */
  skipLockRenewal: true,
  lockDuration: 3600000, // 1시간 (충분히 길게 설정)
})
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly groupRepository: GroupRepository,
  ) {
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

    // 2. 모임 이름 조회
    const groupName = await this.groupRepository.findGroupNameById(
      event.groupId,
    );

    // 3. 도메인 메서드 호출 (Domain Event 자동 발행)
    const passed = event.checkParticipantsForStart(groupName);

    // 4. 저장 (Domain Events 발행됨)
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

    // 3. 모임 이름 조회
    const groupName = await this.groupRepository.findGroupNameById(
      event.groupId,
    );

    // 4. 도메인 메서드 호출 (Domain Event 자동 발행 + 출석 결과 생성)
    event.end(groupName);

    // 5. 저장 (Domain Events 발행됨)
    await this.eventRepository.save(event);

    this.logger.log(
      `일정 종료 완료: eventId=${eventId}, status=${event.status}`,
    );
  }
}
