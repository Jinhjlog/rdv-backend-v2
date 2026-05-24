import { EntityClass, UniqueEntityId } from '@lib/domain';

/**
 * 출석 결과 Enum
 */
export enum AttendanceResult {
  /**
   * 도착
   */
  ARRIVED = 'ARRIVED',

  /**
   * 지각
   */
  LATE = 'LATE',

  /**
   * 부재
   */
  ABSENT = 'ABSENT',
}

export interface EventResultProps {
  id?: string;
  eventId: string;
  userId: string;
  result: AttendanceResult;
  createdAt: Date;
}

export class EventResult extends EntityClass<EventResultProps> {
  private constructor(props: EventResultProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get result(): AttendanceResult {
    return this.props.result;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * 출석 결과를 생성합니다
   */
  static create(
    props: Pick<EventResultProps, 'eventId' | 'userId' | 'result'>,
  ): EventResult {
    return new EventResult({
      eventId: props.eventId,
      userId: props.userId,
      result: props.result,
      createdAt: new Date(),
    });
  }

  /**
   * 검증 없이 생성 (매퍼용)
   */
  static unsafeCreate(props: EventResultProps): EventResult {
    return new EventResult(props);
  }
}
