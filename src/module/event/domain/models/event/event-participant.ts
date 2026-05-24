import { EntityClass, UniqueEntityId } from '@lib/domain';
import { DomainRuleViolationException } from '@shared/exception';

/**
 * 참여자 상태 Enum
 */
export enum ParticipantStatus {
  /**
   * 준비중
   */
  PREPARING = 'PREPARING',

  /**
   * 출발
   */
  DEPARTED = 'DEPARTED',

  /**
   * 도착
   */
  ARRIVED = 'ARRIVED',
}

export interface EventParticipantProps {
  id?: string;
  eventId: string;
  userId: string;
  status: ParticipantStatus;
  joinedAt: Date;
  departedAt?: Date;
  arrivedAt?: Date;
}

export class EventParticipant extends EntityClass<EventParticipantProps> {
  private constructor(props: EventParticipantProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): ParticipantStatus {
    return this.props.status;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  get departedAt(): Date | undefined {
    return this.props.departedAt;
  }

  get arrivedAt(): Date | undefined {
    return this.props.arrivedAt;
  }

  /**
   * 참여자를 생성합니다
   */
  static create(
    props: Pick<EventParticipantProps, 'eventId' | 'userId'>,
  ): EventParticipant {
    return new EventParticipant({
      eventId: props.eventId,
      userId: props.userId,
      status: ParticipantStatus.PREPARING,
      joinedAt: new Date(),
    });
  }

  /**
   * 검증 없이 생성 (매퍼용)
   */
  static unsafeCreate(props: EventParticipantProps): EventParticipant {
    return new EventParticipant(props);
  }

  /**
   * 출발 가능 여부 확인
   *
   * PREPARING 상태인 경우에만 출발 가능
   */
  canDepart(): boolean {
    return this.props.status === ParticipantStatus.PREPARING;
  }

  /**
   * 출발 처리
   *
   * PREPARING → DEPARTED 상태 전환
   * @throws {DomainRuleViolationException} PARTICIPANT_CANNOT_DEPART - 출발할 수 없는 상태인 경우
   */
  depart(): void {
    if (!this.canDepart()) {
      throw new DomainRuleViolationException({
        entityName: 'EventParticipant',
        reason: '준비중 상태에서만 출발할 수 있습니다.',
        errorCode: 'PARTICIPANT_CANNOT_DEPART',
      });
    }

    this.props.status = ParticipantStatus.DEPARTED;
    this.props.departedAt = new Date();
  }

  /**
   * 도착 가능 여부 확인
   *
   * DEPARTED 상태인 경우에만 도착 가능
   */
  canArrive(): boolean {
    return this.props.status === ParticipantStatus.DEPARTED;
  }

  /**
   * 도착 처리
   *
   * DEPARTED → ARRIVED 상태 전환
   * @throws {DomainRuleViolationException} PARTICIPANT_CANNOT_ARRIVE - 도착할 수 없는 상태인 경우
   */
  arrive(): void {
    if (!this.canArrive()) {
      throw new DomainRuleViolationException({
        entityName: 'EventParticipant',
        reason: '출발 상태에서만 도착 처리할 수 있습니다.',
        errorCode: 'PARTICIPANT_CANNOT_ARRIVE',
      });
    }

    this.props.status = ParticipantStatus.ARRIVED;
    this.props.arrivedAt = new Date();
  }
}
