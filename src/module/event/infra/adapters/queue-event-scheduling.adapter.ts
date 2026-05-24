import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '@core/queue/queue.service';
import { EventSchedulingPort } from '../../application/ports';
import { EVENT_QUEUE, EventJobName } from '../../event.constants';

export interface EventJobData {
  eventId: string;
}

@Injectable()
export class QueueEventSchedulingAdapter implements EventSchedulingPort {
  private readonly logger = new Logger(QueueEventSchedulingAdapter.name);

  constructor(private readonly queueService: QueueService) {}

  async scheduleParticipantCheck(
    eventId: string,
    checkTime: Date,
  ): Promise<boolean> {
    return this.scheduleJob(
      EVENT_QUEUE.JOBS.PARTICIPANT_CHECK,
      { eventId },
      checkTime,
      eventId,
    );
  }

  async cancelParticipantCheck(eventId: string): Promise<void> {
    const jobId = this.generateJobId(
      eventId,
      EVENT_QUEUE.JOBS.PARTICIPANT_CHECK,
    );
    await this.queueService.removeJob(EVENT_QUEUE.NAME, jobId);
  }

  async scheduleLocationSharingStart(
    eventId: string,
    startTime: Date,
  ): Promise<boolean> {
    return this.scheduleJob(
      EVENT_QUEUE.JOBS.LOCATION_SHARING_START,
      { eventId },
      startTime,
      eventId,
    );
  }

  async scheduleEventEnd(eventId: string, endTime: Date): Promise<boolean> {
    return this.scheduleJob(
      EVENT_QUEUE.JOBS.END,
      { eventId },
      endTime,
      eventId,
    );
  }

  private async scheduleJob(
    jobName: EventJobName,
    eventData: EventJobData,
    scheduledDate: Date,
    scheduleId: string,
  ): Promise<boolean> {
    try {
      const jobId = this.generateJobId(scheduleId, jobName);

      await this.queueService.scheduleJobAt(
        EVENT_QUEUE.NAME,
        jobName,
        eventData,
        scheduledDate,
        {
          jobId,
          attempts: 3,
          backoff: {
            type: 'exponential' as const,
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: true,
        },
      );

      return true;
    } catch {
      return false;
    }
  }

  private generateJobId(eventId: string, jobName: EventJobName): string {
    return `event-${eventId}-${jobName}`;
  }
}
