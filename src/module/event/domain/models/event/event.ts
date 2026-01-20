import { AggregateRoot, BoundedString, UniqueEntityId } from '@lib/domain';
import { DomainRuleViolationException } from '@shared/exception';
import { EventParticipant } from './event-participant';
import { EventResult } from './event-result';
import { Location } from './location';
import { EventSchedule } from './event-schedule';
import {
  ParticipantsCheckPassedEvent,
  EventCancelledEvent,
  EventStartedEvent,
} from '../../events';

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
  result?: EventResult;
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

  get result(): EventResult | undefined {
    return this.props.result;
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
}
