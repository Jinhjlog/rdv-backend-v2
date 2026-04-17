import { Injectable, Logger } from '@nestjs/common';
import { EventRepository, GroupRepository } from '../../domain/repositories';

/**
 * 일정 스케줄링 잡 처리 서비스
 *
 * BullMQ Processor와 Cloud Tasks HTTP Controller가 공유하는 잡 처리 로직.
 * - 잡 트리거 수단(BullMQ / Cloud Tasks)은 교체 가능해야 하므로
 *   비즈니스 처리 로직을 Application Layer로 추출해 재사용한다.
 *
 * [흐름]
 *   Trigger → Repository 조회 → Domain method → Domain Event 발행 → Repository.save()
 *   이후 부수 효과(푸시 등)는 CQRS EventBus 기반 EventHandler가 담당한다.
 */
@Injectable()
export class EventSchedulerService {
  private readonly logger = new Logger(EventSchedulerService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  /**
   * 참여자 체크 처리
   *
   * - 2명 이상: ParticipantsCheckPassedEvent 발행 → 위치 공유 시작 스케줄링 예약
   * - 1명 이하: EventCancelledEvent 발행 → 일정 취소
   */
  async handleParticipantCheck(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(`일정을 찾을 수 없음: ${eventId}`);
      return;
    }

    const groupName = await this.groupRepository.findGroupNameById(
      event.groupId,
    );

    const passed = event.checkParticipantsForStart(groupName);

    await this.eventRepository.save(event);

    this.logger.log(
      `참여자 체크 완료: eventId=${eventId}, passed=${passed}, participantCount=${event.participants.length}`,
    );
  }

  /**
   * 일정 시작 처리 (위치 공유 시작)
   *
   * RECRUITING → IN_PROGRESS 상태 전환.
   * EventStartedEvent 발행 → 일정 종료 스케줄링 예약.
   */
  async handleLocationSharingStart(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(`일정을 찾을 수 없음: ${eventId}`);
      return;
    }

    if (!event.canStart()) {
      this.logger.warn(
        `일정을 시작할 수 없는 상태: eventId=${eventId}, status=${event.status}`,
      );
      return;
    }

    const groupName = await this.groupRepository.findGroupNameById(
      event.groupId,
    );

    event.start(groupName);

    await this.eventRepository.save(event);

    this.logger.log(
      `일정 시작 완료: eventId=${eventId}, status=${event.status}`,
    );
  }

  /**
   * 일정 종료 처리
   *
   * IN_PROGRESS → ENDED 상태 전환.
   * 출석 결과 생성 (ARRIVED → 도착, DEPARTED → 지각, PREPARING → 부재).
   * EventEndedEvent 발행 → EventHandler에서 푸시 알림 발송.
   */
  async handleEventEnd(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(`일정을 찾을 수 없음: ${eventId}`);
      return;
    }

    if (!event.canEnd()) {
      this.logger.warn(
        `일정을 종료할 수 없는 상태: eventId=${eventId}, status=${event.status}`,
      );
      return;
    }

    const groupName = await this.groupRepository.findGroupNameById(
      event.groupId,
    );

    event.end(groupName);

    await this.eventRepository.save(event);

    this.logger.log(
      `일정 종료 완료: eventId=${eventId}, status=${event.status}`,
    );
  }
}
