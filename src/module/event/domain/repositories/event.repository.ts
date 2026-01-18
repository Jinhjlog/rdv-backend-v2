import { Event } from '../models';

export abstract class EventRepository {
  abstract save(entity: Event): Promise<void>;
  abstract findById(id: string): Promise<Event | undefined>;
}
