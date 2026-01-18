import { EntityClass, UniqueEntityId } from '@lib/domain';

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
  constructor(props: EventParticipantProps) {
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
}
