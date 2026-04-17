import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudTasksClient } from '@google-cloud/tasks';
import { ExternalServiceException } from '@shared/exception';
import { EnvironmentConfig } from '@core/config/environment.config';
import { QueueService } from './queue.service';
import { JobOptions, QueueJob } from './type';

/**
 * Google Cloud Tasks 기반 QueueService 구현체
 *
 * - BullMQ와 달리 Push 방식: Cloud Tasks가 정해진 시간에 HTTP 엔드포인트 호출
 * - Cloud Run min-instances=0 환경에서도 동작 가능 (요청 시점에 인스턴스 기동)
 * - OIDC 토큰으로 인증된 요청만 엔드포인트에 도달하도록 서버 Guard에서 검증
 */
@Injectable()
export class CloudTasksQueueService implements QueueService {
  private readonly logger = new Logger(CloudTasksQueueService.name);
  private readonly client: CloudTasksClient;
  private readonly projectId: string;
  private readonly location: string;
  private readonly invokerServiceAccount: string;
  private readonly targetUrl: string;

  constructor(configService: ConfigService<EnvironmentConfig>) {
    const cloudTasks = configService.get('queue.cloudTasks', { infer: true });

    if (!cloudTasks) {
      throw new Error('Cloud Tasks 설정이 누락되었습니다.');
    }

    this.projectId = cloudTasks.projectId;
    this.location = cloudTasks.location;
    this.invokerServiceAccount = cloudTasks.invokerServiceAccount;
    this.targetUrl = cloudTasks.targetUrl;
    this.client = new CloudTasksClient();
  }

  async scheduleJobAt<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    date: Date,
    options?: JobOptions,
  ): Promise<QueueJob<T>> {
    const scheduledTimestamp = date.getTime();

    if (scheduledTimestamp <= Date.now()) {
      this.logger.error(
        `[${queueName}:${jobName}] 예약 시간은 현재 시간보다 미래여야 합니다.`,
      );
      throw new Error('예약 시간은 현재 시간보다 미래여야 합니다.');
    }

    const parent = this.client.queuePath(
      this.projectId,
      this.location,
      queueName,
    );

    const taskName = options?.jobId
      ? this.client.taskPath(
          this.projectId,
          this.location,
          queueName,
          options.jobId,
        )
      : undefined;

    const body = Buffer.from(JSON.stringify({ jobName, data })).toString(
      'base64',
    );

    try {
      const [response] = await this.client.createTask({
        parent,
        task: {
          name: taskName,
          scheduleTime: {
            seconds: Math.floor(scheduledTimestamp / 1000),
          },
          httpRequest: {
            httpMethod: 'POST',
            url: this.targetUrl,
            headers: { 'Content-Type': 'application/json' },
            body,
            oidcToken: {
              serviceAccountEmail: this.invokerServiceAccount,
              audience: this.targetUrl,
            },
          },
        },
      });

      const createdTaskName = response.name ?? '';
      const createdJobId = createdTaskName
        ? createdTaskName.split('/tasks/').pop() || createdTaskName
        : (options?.jobId ?? '');

      this.logger.log(
        `[${queueName}:${jobName}] 작업 예약 완료. taskName: ${createdTaskName}, data: ${JSON.stringify(
          data,
        )}`,
      );

      return {
        id: createdJobId,
        data,
      };
    } catch (error) {
      this.logger.error(
        `[${queueName}:${jobName}] 작업 예약 실패`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new ExternalServiceException({
        serviceName: 'Cloud Tasks',
        reason: `작업 예약 실패: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        errorCode: 'CLOUD_TASKS_SCHEDULE_FAILED',
      });
    }
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const taskName = this.client.taskPath(
      this.projectId,
      this.location,
      queueName,
      jobId,
    );

    try {
      await this.client.deleteTask({ name: taskName });
      this.logger.log(`[${queueName}] 작업 취소 완료. jobId: ${jobId}`);
    } catch (error) {
      // NOT_FOUND (code: 5): 이미 실행됐거나 삭제된 작업 → 취소는 무시 가능
      if (this.isNotFoundError(error)) {
        this.logger.warn(
          `[${queueName}] 작업이 이미 존재하지 않음 (실행 완료 또는 삭제됨). jobId: ${jobId}`,
        );
        return;
      }

      this.logger.error(
        `[${queueName}] 작업 취소 실패. jobId: ${jobId}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new ExternalServiceException({
        serviceName: 'Cloud Tasks',
        reason: `작업 취소 실패: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        errorCode: 'CLOUD_TASKS_DELETE_FAILED',
      });
    }
  }

  private isNotFoundError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const code = (error as { code?: number }).code;
    return code === 5;
  }
}
