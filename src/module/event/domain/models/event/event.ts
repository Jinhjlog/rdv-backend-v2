import { AggregateRoot, BoundedString, UniqueEntityId } from '@lib/domain';
import { EventParticipant } from './event-participant';
import { EventResult } from './event-result';
import { Location } from './location';

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
}

export interface EventProps {
  id?: string;
  groupId: string;
  createdBy: string;
  title: BoundedString;
  description: BoundedString;
  eventTime: Date;
  trackingStartTime: Date;
  endTime: Date;
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

  get eventTime(): Date {
    return this.props.eventTime;
  }

  get trackingStartTime(): Date {
    return this.props.trackingStartTime;
  }

  get endTime(): Date {
    return this.props.endTime;
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
}
