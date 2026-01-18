import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EVENT_QUEUE } from '../../event.constants';
import { Injectable, Logger } from '@nestjs/common';
import { EventJobData } from '../services';
import { Job } from 'bullmq';

@Injectable()
@Processor(EVENT_QUEUE.NAME)
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);

  constructor() {
    super();
  }

  async process(job: Job<EventJobData>): Promise<void> {
    this.logger.log(
      `Processing job ${job.name} with ID ${job.id} for event ${job.data.eventId}`,
    );

    try {
      switch (job.name) {
        case EVENT_QUEUE.JOBS.PARTICIPANT_CHECK:
          // TODO: Implement participant check logic here
          break;
        case EVENT_QUEUE.JOBS.LOCATION_SHARING_START:
          break;
        case EVENT_QUEUE.JOBS.END:
          break;
      }

      await Promise.resolve();
    } catch (error) {
      this.logger.error(
        `이벤트 작업 처리 중 오류 발생: jobId=${job.id}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );

      throw error;
    }
  }
}
