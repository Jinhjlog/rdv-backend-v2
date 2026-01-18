import { JobOptions, QueueJob } from './type';

export abstract class QueueService {
  /**
   * 특정 시간에 작업 예약
   */
  abstract scheduleJobAt<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    date: Date,
    options?: JobOptions,
  ): Promise<QueueJob<T>>;

  /**
   * 작업 취소
   */
  abstract removeJob(queueName: string, jobId: string): Promise<void>;
}
