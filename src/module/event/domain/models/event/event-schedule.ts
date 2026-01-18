import { ValueObject } from '@lib/domain';
import { ValueObjectValidationException } from '@shared/exception';

export const EventScheduleError = {
  INVALID_EVENT_TIME_FORMAT:
    '이벤트 시간 형식이 올바르지 않습니다. (ISO 8601 형식 필요)',
  INVALID_EVENT_TIME:
    '유효하지 않은 날짜입니다. 존재하는 날짜와 시간인지 확인해주세요.',
  EVENT_TIME_TOO_SOON: '이벤트 시간은 현재 시간보다 20분 이후여야 합니다.',
} as const;

export interface EventScheduleProps {
  eventTime: Date;
  trackingStartTime: Date;
  endTime: Date;
}

export interface EventScheduleCreateInput {
  eventTimeString: string; // ISO 8601 형식
}

export class EventSchedule extends ValueObject<EventScheduleProps> {
  private static readonly MIN_ADVANCE_MINUTES = 20 * 60 * 1000; // 20분
  private static readonly TRACKING_START_OFFSET_MINUTES = 15 * 60 * 1000; // eventTime 기준 15분 전
  private static readonly END_TIME_OFFSET_MINUTES = 1 * 60 * 1000; // eventTime 기준 1분 후
  private static readonly PARTICIPANT_CHECK_OFFSET_MINUTES = 20 * 60 * 1000; // eventTime 기준 20분 전
  private static readonly ISO_8601_REGEX =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

  private constructor(props: EventScheduleProps) {
    super(props);
  }

  get eventTime(): Date {
    return new Date(this.props.eventTime);
  }

  get trackingStartTime(): Date {
    return new Date(this.props.trackingStartTime);
  }

  get endTime(): Date {
    return new Date(this.props.endTime);
  }

  get participantCheckTime(): Date {
    const targetTime = new Date(this.props.eventTime);

    return new Date(
      targetTime.getTime() - EventSchedule.PARTICIPANT_CHECK_OFFSET_MINUTES,
    );
  }

  private static isValidISO8601Format(dateString: string): boolean {
    return this.ISO_8601_REGEX.test(dateString);
  }

  static create(input: EventScheduleCreateInput): EventSchedule {
    // 이벤트 시간 형식 검증
    if (!this.isValidISO8601Format(input.eventTimeString)) {
      throw new ValueObjectValidationException({
        entityName: 'EventSchedule',
        reason: EventScheduleError.INVALID_EVENT_TIME_FORMAT,
        errorCode: 'EVENT_TIME_FORMAT_INVALID',
      });
    }

    const eventTime = new Date(input.eventTimeString);
    if (isNaN(eventTime.getTime())) {
      throw new ValueObjectValidationException({
        entityName: 'EventSchedule',
        reason: EventScheduleError.INVALID_EVENT_TIME,
        errorCode: 'EVENT_TIME_INVALID',
      });
    }

    // ISO 8601 형식 일치 여부 검증
    if (eventTime.toISOString() !== input.eventTimeString) {
      throw new ValueObjectValidationException({
        entityName: 'EventSchedule',
        reason: EventScheduleError.INVALID_EVENT_TIME,
        errorCode: 'EVENT_TIME_INVALID',
      });
    }

    // 현재 시간보다 최소 20분 이후여야 함
    const now = new Date();
    const minEventTime = new Date(now.getTime() + this.MIN_ADVANCE_MINUTES);
    if (eventTime <= minEventTime) {
      throw new ValueObjectValidationException({
        entityName: 'EventSchedule',
        reason: EventScheduleError.EVENT_TIME_TOO_SOON,
        errorCode: 'EVENT_TIME_TOO_SOON',
      });
    }

    // trackingStartTime: eventTime으로부터 15분 전
    const trackingStartTime = new Date(
      eventTime.getTime() - this.TRACKING_START_OFFSET_MINUTES,
    );

    // endTime: eventTime으로부터 1분 후
    const endTime = new Date(
      eventTime.getTime() + this.END_TIME_OFFSET_MINUTES,
    );

    return new EventSchedule({ eventTime, trackingStartTime, endTime });
  }

  static unsafeCreate(props: EventScheduleProps): EventSchedule {
    return new EventSchedule(props);
  }
}
