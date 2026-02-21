import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { formatKoreanDateTime } from '@shared/utils';
import { EventCreatedEvent } from '../../../event/domain/events';
import { AlertPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 새 일정 생성 푸시 핸들러
 *
 * EventCreatedEvent를 수신하여 MEETING 알림 구독 중인 모임 멤버(생성자 제외)에게
 * Alert 푸시를 전송합니다.
 */
@Injectable()
export class EventCreatedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(EventCreatedPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventCreatedEvent) => void this.handle(event),
      EventCreatedEvent.name,
    );
  }

  async handle(event: EventCreatedEvent): Promise<void> {
    const {
      eventId,
      groupId,
      groupName,
      createdByUserId,
      groupMemberUserIds,
      title,
      eventTime,
    } = event.metadata;

    const targetUserIds = groupMemberUserIds.filter(
      (id) => id !== createdByUserId,
    );

    if (targetUserIds.length === 0) {
      this.logger.log('푸시 대상 없음 (모임 멤버가 생성자 본인뿐)');
      return;
    }

    const formattedTime = formatKoreanDateTime(eventTime);

    const result =
      await this.pushDispatchService.sendAlertPushToTargetSubscribers({
        userIds: targetUserIds,
        type: AlertPushType.Meeting,
        topic: 'event-created',
        notification: {
          title: '📅 새 일정이 등록됐어요',
          body: `${groupName} · ${title} · ${formattedTime}`,
        },
        data: {
          targetScreen: 'eventDetail',
          eventId,
          groupId,
        },
      });

    if (!result.sent) {
      this.logger.warn(
        `새 일정 푸시 발송 대상 없음: eventId=${eventId} (구독 중인 유저 없음 또는 토큰 없음)`,
      );
      return;
    }

    this.logger.log(
      `새 일정 Alert 푸시 발송 완료: eventId=${eventId}, 성공=${result.successCount}, 실패=${result.failureCount}`,
    );
  }
}
