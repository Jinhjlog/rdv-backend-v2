import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EVENT_QUEUE } from './event.constants';
import { EventQueueService } from './infra/services';
import { EventProcessor } from './infra/processors';
import {
  EventQueryRepositoryImpl,
  EventRepositoryImpl,
  GroupRepositoryImpl,
} from './infra/repositories';
import {
  EventQueryRepository,
  EventRepository,
  GroupRepository,
} from './domain/repositories';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EVENT_QUEUE.NAME,
    }),
  ],
  providers: [
    {
      provide: EventQueryRepository,
      useClass: EventQueryRepositoryImpl,
    },
    {
      provide: EventRepository,
      useClass: EventRepositoryImpl,
    },
    {
      provide: GroupRepository,
      useClass: GroupRepositoryImpl,
    },
    EventQueueService,
    EventProcessor,
  ],
  exports: [
    EventQueryRepository,
    EventRepository,
    GroupRepository,
    EventQueueService,
    EventProcessor,
  ],
})
export class EventCoreModule {}
