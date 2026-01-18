import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '@core/queue/queue.service';
import { EVENT_QUEUE, EventJobName } from '../../event.constants';

export interface EventJobData {
  eventId: string;
}

@Injectable()
export class EventQueueService {
  private logger = new Logger(EventQueueService.name);

  constructor(private readonly queueService: QueueService) {}

  // 참여자 체크 예약
  async scheduleParticipantCheck(
    eventId: string,
    checkTime: Date,
  ): Promise<boolean> {
    return this.scheduleJob<EventJobData>(
      EVENT_QUEUE.JOBS.PARTICIPANT_CHECK,
      { eventId },
      checkTime,
      eventId,
    );
  }

  // 참여자 체크 취소 ← 사용자 취소 시 호출
  async cancelParticipantCheck(eventId: string): Promise<void> {
    const jobId = this.generateJobId(
      eventId,
      EVENT_QUEUE.JOBS.PARTICIPANT_CHECK,
    );
    await this.queueService.removeJob(EVENT_QUEUE.NAME, jobId);
  }

  // 위치 공유 시작 예약
  scheduleLocationSharingStart(
    eventId: string,
    startTime: Date,
  ): Promise<boolean> {
    return this.scheduleJob<EventJobData>(
      EVENT_QUEUE.JOBS.LOCATION_SHARING_START,
      { eventId },
      startTime,
      eventId,
    );
  }

  // 일정 종료 예약
  scheduleEventEnd(eventId: string, endTime: Date): Promise<boolean> {
    return this.scheduleJob<EventJobData>(
      EVENT_QUEUE.JOBS.END,
      { eventId },
      endTime,
      eventId,
    );
  }

  private async scheduleJob<T>(
    jobName: EventJobName,
    eventData: T,
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
