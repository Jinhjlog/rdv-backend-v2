import { Module } from '@nestjs/common';
import { EventCoreModule } from './event-core.module';
import { EventQueueController } from './presentation/controllers';

/**
 * Cloud Tasks 수신 엔드포인트 등록 모듈
 *
 * Cloud Tasks가 `/internal/queue/event`로 호출한 요청을 받아
 * EventSchedulerService에 위임한다.
 *
 * QUEUE_DRIVER=cloud-tasks 모드에서만 AppModule에 포함된다.
 */
@Module({
  imports: [EventCoreModule],
  controllers: [EventQueueController],
})
export class EventQueueModule {}
