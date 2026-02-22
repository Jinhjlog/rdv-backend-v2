import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { EventStartedEvent } from '../../../event/domain/events';
import { AlertPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 일정 시작 시 Alert 푸시 발송 핸들러
 *
 * EventStartedEvent를 수신하여 일정 참여자들에게 Alert 푸시를 발송합니다.
 * 참여자들에게 "출발" 상태 변경을 유도하여 위치 공유를 시작하게 합니다.
 */
@Injectable()
export class EventStartedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(EventStartedPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventStartedEvent) => void this.handle(event),
      EventStartedEvent.name,
    );
  }

  async handle(event: EventStartedEvent): Promise<void> {
    const { eventId, groupId, groupName, title, participantUserIds } =
      event.metadata;

    if (participantUserIds.length === 0) {
      this.logger.log('푸시 대상 없음');
      return;
    }

    const result =
      await this.pushDispatchService.sendAlertPushToTargetSubscribers({
        userIds: participantUserIds,
        type: AlertPushType.Meeting,
        topic: 'event-started',
        notification: {
          title: '🚀 곧 약속 시간이에요!',
          body: `${groupName} · ${title} · 출발 버튼을 눌러주세요`,
        },
        data: {
          targetScreen: 'eventDetail',
          eventId,
          groupId,
        },
      });

    if (!result.sent) {
      this.logger.warn(
        `일정 시작 푸시 발송 대상 없음: eventId=${eventId} (구독 중인 유저 없음 또는 토큰 없음)`,
      );
      return;
    }

    this.logger.log(
      `일정 시작 Alert 푸시 발송 완료: eventId=${eventId}, 성공=${result.successCount}, 실패=${result.failureCount}`,
    );
  }
}
