import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EVENT_QUEUE } from './event.constants';
import { EventProcessor } from './infra/processors';
import { EventRepositoryImpl } from './infra/repositories';
import { EventRepository } from './domain/repositories';
import { EventQueryService, GroupLookupService } from './domain/services';
import { EventSchedulingPort } from './application/ports';
import {
  EventQueryServiceImpl,
  GroupLookupServiceImpl,
} from './infra/services';
import {
  QueueEventSchedulingAdapter,
  MockEventSchedulingAdapter,
} from './infra/adapters';
import {
  ParticipantsCheckPassedEventHandler,
  EventStartedEventHandler,
  EventEndedEventHandler,
} from './application/handlers';
import { EventSchedulerService } from './application/services';

const queueDriver =
  process.env.QUEUE_DRIVER === 'cloud-tasks' ? 'cloud-tasks' : 'bullmq';

const isTest = process.env.NODE_ENV === 'test';

const bullQueueImports =
  queueDriver === 'bullmq' && !isTest
    ? [BullModule.registerQueue({ name: EVENT_QUEUE.NAME })]
    : [];

const bullProcessors =
  queueDriver === 'bullmq' && !isTest ? [EventProcessor] : [];

@Module({
  imports: [...bullQueueImports],
  providers: [
    {
      provide: EventRepository,
      useClass: EventRepositoryImpl,
    },
    {
      provide: EventQueryService,
      useClass: EventQueryServiceImpl,
    },
    {
      provide: GroupLookupService,
      useClass: GroupLookupServiceImpl,
    },
    {
      provide: EventSchedulingPort,
      useClass: isTest
        ? MockEventSchedulingAdapter
        : QueueEventSchedulingAdapter,
    },
    EventSchedulerService,
    ...bullProcessors,
    ParticipantsCheckPassedEventHandler,
    EventStartedEventHandler,
    EventEndedEventHandler,
  ],
  exports: [
    EventRepository,
    EventQueryService,
    GroupLookupService,
    EventSchedulingPort,
    EventSchedulerService,
  ],
})
export class EventCoreModule {}
