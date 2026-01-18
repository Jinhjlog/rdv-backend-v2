import { Queue, JobsOptions as BullJobOptions } from 'bullmq';
import { QueueService } from './queue.service';
import { JobOptions, QueueJob } from './type';
import { ModuleRef } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';

@Injectable()
export class BullQueueService implements QueueService {
  private readonly logger = new Logger(BullQueueService.name);

  constructor(private moduleRef: ModuleRef) {}

  async scheduleJobAt<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    date: Date,
    options?: JobOptions,
  ): Promise<QueueJob<T>> {
    const delay = date.getTime() - Date.now();

    if (delay < 0) {
      this.logger.error(
        `[${queueName}:${jobName}] 예약 시간은 현재 시간보다 미래여야 합니다.`,
      );
      throw new Error('예약 시간은 현재 시간보다 미래여야 합니다.');
    }

    const queue = this.getQueue(queueName);
    const bullOptions = this.mapOptions(options);

    const bullJob = await queue.add(jobName, data, {
      delay,
      ...bullOptions,
    });

    if (!bullJob.id) {
      await bullJob.remove();
      this.logger.error(`[${queueName}:${jobName}] 작업 예약에 실패했습니다.`);
      throw new Error('작업 예약에 실패했습니다.');
    }

    this.logger.log(
      `[${queueName}:${jobName}] 작업 예약 완료. jobId: ${bullJob.id}, data: ${JSON.stringify(
        data,
      )}`,
    );
    return {
      id: bullJob.id,
      data: bullJob.data as T,
    };
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      this.logger.error(`[${queueName}] Job ID ${jobId}을 찾을 수 없습니다.`);
      throw new Error(`Job ID ${jobId}을 찾을 수 없습니다.`);
    }

    await job.remove();
    this.logger.log(
      `[${queueName}] 작업 취소 완료. jobId: ${job.id}, data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  private getQueue(queueName: string): Queue {
    try {
      return this.moduleRef.get<Queue>(getQueueToken(queueName), {
        strict: false,
      });
    } catch (error) {
      this.logger.error(`[${queueName}] 큐를 찾을 수 없습니다.`, error);
      throw new Error(`Queue ${queueName}을 찾을 수 없습니다. ${error}`);
    }
  }

  private mapOptions(options?: JobOptions): BullJobOptions {
    if (!options) {
      return {};
    }

    return {
      jobId: options.jobId,
      backoff: options.backoff,
      removeOnComplete: options.removeOnComplete,
      removeOnFail: options.removeOnFail,
      attempts: options.attempts,
      priority: options.priority,
    };
  }
}
