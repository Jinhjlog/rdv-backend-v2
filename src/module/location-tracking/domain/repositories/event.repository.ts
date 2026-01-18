export abstract class EventRepository {
  abstract existsByStatusInProgress(eventId: string): Promise<boolean>;
}
