import { Event } from '../models';

export abstract class EventRepository {
  abstract save(entity: Event): Promise<void>;
  abstract delete(event: Event): Promise<void>;
  abstract findById(id: string): Promise<Event | undefined>;
  abstract findRecurringEventCountByGroupId(groupId: string): Promise<number>;
  abstract hasScheduleConflict(
    userId: string,
    trackingStartTime: Date,
    endTime: Date,
    excludeEventId?: string,
  ): Promise<boolean>;
}
