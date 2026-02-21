import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { AttendanceResult } from 'src/module/event/domain/models/event/event-result';
import { EventEndedEvent } from '../../../event/domain/events';
import { AlertPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 출석 결과 푸시 핸들러
 *
 * EventEndedEvent를 수신하여 MEETING 알림 구독 중인 참여자 전원에게 Alert 푸시를 전송합니다.
 * - E6: 📊 출석 결과가 나왔어요 · {일정 제목} · 도착 {N}명 · 지각 {N}명
 */
@Injectable()
export class EventEndedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(EventEndedPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: EventEndedEvent) => void this.handle(event),
      EventEndedEvent.name,
    );
  }

  async handle(event: EventEndedEvent): Promise<void> {
    const { eventId, groupId, title, results } = event.metadata;

    const participantUserIds = results.map((r) => r.userId);

    if (participantUserIds.length === 0) {
      this.logger.log('푸시 대상 없음');
      return;
    }

    const arrivedCount = results.filter(
      (r) => r.result === AttendanceResult.ARRIVED,
    ).length;
    const lateCount = results.filter(
      (r) => r.result === AttendanceResult.LATE,
    ).length;

    const body = `${title} · 도착 ${arrivedCount}명 · 지각 ${lateCount}명`;

    const result =
      await this.pushDispatchService.sendAlertPushToTargetSubscribers({
        userIds: participantUserIds,
        type: AlertPushType.Meeting,
        topic: 'event-ended',
        notification: { title: '📊 출석 결과가 나왔어요', body },
        data: {
          targetScreen: 'eventDetail',
          eventId,
          groupId,
        },
      });

    if (!result.sent) {
      this.logger.warn(`출석 결과 푸시 발송 대상 없음: eventId=${eventId}`);
      return;
    }

    this.logger.log(
      `출석 결과 Alert 푸시 발송 완료: eventId=${eventId}, 성공=${result.successCount}, 실패=${result.failureCount}`,
    );
  }
}
