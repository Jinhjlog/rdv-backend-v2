import { AggregateRoot, BoundedString, UniqueEntityId } from '@lib/domain';
import {
  DomainRuleViolationException,
  EntityNotFoundException,
} from '@shared/exception';
import { EventParticipant } from './event-participant';
import { EventResult } from './event-result';
import { Location } from './location';
import { EventSchedule } from './event-schedule';
import {
  ParticipantsCheckPassedEvent,
  EventCancelledEvent,
  EventStartedEvent,
  EventEndedEvent,
  ParticipantDepartedEvent,
} from '../../events';
import { ParticipantStatus } from './event-participant';
import { AttendanceResult } from './event-result';

const MIN_PARTICIPANTS_FOR_START = 2;

/**
 * 일정 상태 Enum
 */
export enum EventStatus {
  /**
   * 모집중
   */
  RECRUITING = 'RECRUITING',

  /**
   * 진행중
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * 종료됨
   */
  ENDED = 'ENDED',

  /**
   * 취소됨 (참여자 부족 등)
   */
  CANCELLED = 'CANCELLED',
}

export interface EventProps {
  id?: string;
  groupId: string;
  createdBy: string;
  title: BoundedString;
  description: BoundedString;
  schedule: EventSchedule;
  location: Location;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;

  participants: EventParticipant[];
  results: EventResult[];
}

export class Event extends AggregateRoot<EventProps> {
  constructor(props: EventProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get title(): BoundedString {
    return this.props.title;
  }

  get description(): BoundedString {
    return this.props.description;
  }

  get schedule(): EventSchedule {
    return this.props.schedule;
  }

  get location(): Location {
    return this.props.location;
  }

  get status(): EventStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get participants(): EventParticipant[] {
    return this.props.participants;
  }

  get results(): EventResult[] {
    return this.props.results;
  }

  /**
   * 일정 참가자 추가
   *
   * @param participant 일정 참가자
   * @throws {DomainRuleViolationException} ALREADY_PARTICIPATING - 이미 참여 중인 일정인 경우
   */
  addParticipant(participant: EventParticipant): void {
    if (this.props.participants.some((p) => p.userId === participant.userId)) {
      throw new DomainRuleViolationException({
        entityName: 'EventParticipant',
        reason: '이미 참여 중인 일정입니다.',
        errorCode: 'ALREADY_PARTICIPATING',
      });
    }

    this.props.participants.push(participant);
  }

  /**
   * 일정 참여 철회 (참가자 제거)
   *
   * @param userId 사용자 ID
   * @throws {DomainRuleViolationException} EVENT_NOT_RECRUITING - 모집중 상태가 아닌 경우
   * @throws {DomainRuleViolationException} CREATOR_CANNOT_WITHDRAW - 일정 생성자인 경우
   * @throws {EntityNotFoundException} PARTICIPANT_NOT_FOUND - 참여자를 찾을 수 없는 경우
   */
  removeParticipant(userId: string): void {
    if (this.props.status !== EventStatus.RECRUITING) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '모집중인 일정에서만 참여를 철회할 수 있습니다.',
        errorCode: 'EVENT_NOT_RECRUITING',
      });
    }

    if (this.props.createdBy === userId) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '일정 생성자는 참여를 철회할 수 없습니다.',
        errorCode: 'CREATOR_CANNOT_WITHDRAW',
      });
    }

    const participantIndex = this.props.participants.findIndex(
      (p) => p.userId === userId,
    );

    if (participantIndex === -1) {
      throw new EntityNotFoundException({
        entityName: 'EventParticipant',
        errorCode: 'PARTICIPANT_NOT_FOUND',
        id: userId,
      });
    }

    this.props.participants.splice(participantIndex, 1);
    this.props.updatedAt = new Date();
  }

  /**
   * 일정 취소 가능 여부 확인
   *
   * RECRUITING 상태인 경우에만 취소 가능
   */
  canBeCancelled(): boolean {
    return this.props.status === EventStatus.RECRUITING;
  }

  /**
   * 일정 취소
   *
   * @param reason 취소 사유
   * @throws {DomainRuleViolationException} EVENT_CANNOT_BE_CANCELLED - 취소할 수 없는 상태인 경우
   */
  cancel(reason: string): void {
    if (!this.canBeCancelled()) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '모집중인 일정만 취소할 수 있습니다.',
        errorCode: 'EVENT_CANNOT_BE_CANCELLED',
      });
    }

    this.props.status = EventStatus.CANCELLED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new EventCancelledEvent(this.id, {
        eventId: this.id.toString(),
        reason,
        participantCount: this.props.participants.length,
      }),
    );
  }

  /**
   * 참여자 수 체크 후 시작 가능 여부 결정
   *
   * - 참여자 2명 이상: ParticipantsCheckPassedEvent 발행
   * - 참여자 1명 이하: 일정 취소 (EventCancelledEvent 발행)
   *
   * @returns 참여자 체크 통과 여부
   */
  checkParticipantsForStart(): boolean {
    if (this.props.status !== EventStatus.RECRUITING) {
      return false;
    }

    const participantCount = this.props.participants.length;

    if (participantCount >= MIN_PARTICIPANTS_FOR_START) {
      this.addDomainEvent(
        new ParticipantsCheckPassedEvent(this.id, {
          eventId: this.id.toString(),
          participantCount,
          trackingStartTime: this.props.schedule.trackingStartTime,
        }),
      );
      return true;
    } else {
      this.cancel(
        `참여자 ${participantCount}명, 최소 인원(${MIN_PARTICIPANTS_FOR_START}명) 미달`,
      );
      return false;
    }
  }

  /**
   * 일정 시작 가능 여부 확인
   *
   * RECRUITING 상태인 경우에만 시작 가능
   */
  canStart(): boolean {
    return this.props.status === EventStatus.RECRUITING;
  }

  /**
   * 일정 시작 (RECRUITING → IN_PROGRESS)
   *
   * @throws {DomainRuleViolationException} EVENT_CANNOT_START - 시작할 수 없는 상태인 경우
   */
  start(): void {
    if (!this.canStart()) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '모집중인 일정만 시작할 수 있습니다.',
        errorCode: 'EVENT_CANNOT_START',
      });
    }

    this.props.status = EventStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new EventStartedEvent(this.id, {
        eventId: this.id.toString(),
        groupId: this.props.groupId,
        participantUserIds: this.props.participants.map((p) => p.userId),
        eventTime: this.props.schedule.eventTime,
        endTime: this.props.schedule.endTime,
      }),
    );
  }

  /**
   * 일정 종료 가능 여부 확인
   *
   * IN_PROGRESS 상태인 경우에만 종료 가능
   */
  canEnd(): boolean {
    return this.props.status === EventStatus.IN_PROGRESS;
  }

  /**
   * 참여자 상태를 출석 결과로 변환
   */
  private mapParticipantStatusToResult(
    status: ParticipantStatus,
  ): AttendanceResult {
    switch (status) {
      case ParticipantStatus.ARRIVED:
        return AttendanceResult.ARRIVED;
      case ParticipantStatus.DEPARTED:
        return AttendanceResult.LATE;
      case ParticipantStatus.PREPARING:
        return AttendanceResult.ABSENT;
    }
  }

  /**
   * 참여자 찾기
   *
   * @param userId 사용자 ID
   * @returns 참여자
   * @throws {DomainRuleViolationException} PARTICIPANT_NOT_FOUND - 참여자를 찾을 수 없는 경우
   */
  private findParticipant(userId: string): EventParticipant {
    const participant = this.props.participants.find(
      (p) => p.userId === userId,
    );
    if (!participant) {
      throw new DomainRuleViolationException({
        entityName: 'EventParticipant',
        reason: '참여자를 찾을 수 없습니다.',
        errorCode: 'PARTICIPANT_NOT_FOUND',
      });
    }
    return participant;
  }

  /**
   * 참여자 출발 처리
   *
   * @param userId 사용자 ID
   * @throws {DomainRuleViolationException} EVENT_NOT_IN_PROGRESS - 일정이 진행중이 아닌 경우
   * @throws {DomainRuleViolationException} PARTICIPANT_NOT_FOUND - 참여자를 찾을 수 없는 경우
   * @throws {DomainRuleViolationException} PARTICIPANT_CANNOT_DEPART - 출발할 수 없는 상태인 경우
   */
  departParticipant(userId: string): void {
    if (this.props.status !== EventStatus.IN_PROGRESS) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '진행중인 일정에서만 출발할 수 있습니다.',
        errorCode: 'EVENT_NOT_IN_PROGRESS',
      });
    }

    const participant = this.findParticipant(userId);
    participant.depart();
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new ParticipantDepartedEvent(this.id, {
        eventId: this.id.toString(),
        groupId: this.props.groupId,
        userId,
      }),
    );
  }

  /**
   * 참여자 도착 처리
   *
   * @param userId 사용자 ID
   * @throws {DomainRuleViolationException} EVENT_NOT_IN_PROGRESS - 일정이 진행중이 아닌 경우
   * @throws {DomainRuleViolationException} PARTICIPANT_NOT_FOUND - 참여자를 찾을 수 없는 경우
   * @throws {DomainRuleViolationException} PARTICIPANT_CANNOT_ARRIVE - 도착할 수 없는 상태인 경우
   */
  arriveParticipant(userId: string): void {
    if (this.props.status !== EventStatus.IN_PROGRESS) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '진행중인 일정에서만 도착 처리할 수 있습니다.',
        errorCode: 'EVENT_NOT_IN_PROGRESS',
      });
    }

    const participant = this.findParticipant(userId);
    participant.arrive();
    this.props.updatedAt = new Date();
  }

  /**
   * 일정 종료 (IN_PROGRESS → ENDED)
   *
   * 참여자 상태에 따라 출석 결과를 생성합니다:
   * - ARRIVED → ARRIVED (도착)
   * - DEPARTED → LATE (지각)
   * - PREPARING → ABSENT (부재)
   *
   * @throws {DomainRuleViolationException} EVENT_CANNOT_END - 종료할 수 없는 상태인 경우
   */
  end(): void {
    if (!this.canEnd()) {
      throw new DomainRuleViolationException({
        entityName: 'Event',
        reason: '진행중인 일정만 종료할 수 있습니다.',
        errorCode: 'EVENT_CANNOT_END',
      });
    }

    this.props.status = EventStatus.ENDED;
    this.props.updatedAt = new Date();

    // 출석 결과 엔티티 생성
    this.props.results = this.props.participants.map((participant) =>
      EventResult.create({
        eventId: this.id.toString(),
        userId: participant.userId,
        result: this.mapParticipantStatusToResult(participant.status),
      }),
    );

    this.addDomainEvent(
      new EventEndedEvent(this.id, {
        eventId: this.id.toString(),
        groupId: this.props.groupId,
        results: this.props.results.map((r) => ({
          userId: r.userId,
          result: r.result,
        })),
      }),
    );
  }
}
