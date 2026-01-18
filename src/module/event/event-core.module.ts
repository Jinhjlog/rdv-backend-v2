import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EVENT_QUEUE } from './event.constants';
import { EventQueueService } from './infra/services';
import { EventProcessor } from './infra/processors';
import { EventQueryRepositoryImpl } from './infra/repositories';
import { EventQueryRepository } from './domain/repositories';

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
    EventQueueService,
    EventProcessor,
  ],
  exports: [EventQueryRepository, EventQueueService, EventProcessor],
})
export class EventCoreModule {}
