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
import {
  ParticipantsCheckPassedEventHandler,
  EventStartedEventHandler,
  EventEndedEventHandler,
} from './application/handlers';
import { EventSchedulerService } from './application/services';

/**
 * QUEUE_DRIVER 환경변수에 따라 BullMQ 관련 리소스를 조건부 등록한다.
 *
 * - `bullmq`: BullModule.registerQueue + EventProcessor 등록
 * - `cloud-tasks`: 위 두 가지 스킵 (대신 EventQueueController가 활성화됨)
 */
const queueDriver =
  process.env.QUEUE_DRIVER === 'cloud-tasks' ? 'cloud-tasks' : 'bullmq';

const bullQueueImports =
  queueDriver === 'bullmq'
    ? [BullModule.registerQueue({ name: EVENT_QUEUE.NAME })]
    : [];

const bullProcessors = queueDriver === 'bullmq' ? [EventProcessor] : [];

@Module({
  imports: [...bullQueueImports],
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
    EventSchedulerService,
    ...bullProcessors,
    // Event Handlers
    ParticipantsCheckPassedEventHandler,
    EventStartedEventHandler,
    EventEndedEventHandler,
  ],
  exports: [
    EventQueryRepository,
    EventRepository,
    GroupRepository,
    EventQueueService,
    EventSchedulerService,
  ],
})
export class EventCoreModule {}
