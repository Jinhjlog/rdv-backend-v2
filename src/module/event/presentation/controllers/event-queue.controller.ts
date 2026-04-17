import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { CloudTasksAuthGuard } from 'src/module/auth/guards';
import { EVENT_QUEUE } from '../../event.constants';
import { EventSchedulerService } from '../../application/services';
import { EventQueuePayloadRequestDto } from '../dtos';

/**
 * Cloud Tasks 수신 엔드포인트 (내부 전용)
 *
 * - Cloud Tasks가 예약 시간에 HTTP POST로 호출
 * - CloudTasksAuthGuard 로 OIDC 토큰 검증 후 통과한 요청만 처리
 * - 잡 처리 로직은 EventSchedulerService에 위임
 *
 * 최종 엔드포인트 경로: POST /internal/queue/event
 *   (globalPrefix `api` 제외 + version neutral)
 */
@ApiExcludeController()
@Controller({ path: 'internal/queue/event', version: VERSION_NEUTRAL })
@UseGuards(CloudTasksAuthGuard)
export class EventQueueController {
  private readonly logger = new Logger(EventQueueController.name);

  constructor(private readonly eventSchedulerService: EventSchedulerService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Body() payload: EventQueuePayloadRequestDto): Promise<void> {
    this.logger.log(
      `Cloud Task 수신: jobName=${payload.jobName}, eventId=${payload.data.eventId}`,
    );

    try {
      switch (payload.jobName) {
        case EVENT_QUEUE.JOBS.PARTICIPANT_CHECK:
          await this.eventSchedulerService.handleParticipantCheck(
            payload.data.eventId,
          );
          break;
        case EVENT_QUEUE.JOBS.LOCATION_SHARING_START:
          await this.eventSchedulerService.handleLocationSharingStart(
            payload.data.eventId,
          );
          break;
        case EVENT_QUEUE.JOBS.END:
          await this.eventSchedulerService.handleEventEnd(payload.data.eventId);
          break;
      }
    } catch (error) {
      this.logger.error(
        `Cloud Task 처리 중 오류 발생: jobName=${payload.jobName}, eventId=${payload.data.eventId}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );

      throw error;
    }
  }
}
