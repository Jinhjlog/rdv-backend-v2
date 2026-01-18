import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EVENT_QUEUE } from './event.constants';
import { EventQueueService } from './infra/services';
import { EventProcessor } from './infra/processors';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EVENT_QUEUE.NAME,
    }),
  ],
  providers: [EventQueueService, EventProcessor],
  exports: [EventQueueService, EventProcessor],
})
export class EventCoreModule {}
