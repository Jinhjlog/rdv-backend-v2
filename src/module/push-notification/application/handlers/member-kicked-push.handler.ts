import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { MemberKickedEvent } from '../../../group/domain/events';
import { AlertPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 멤버 강퇴 푸시 핸들러
 *
 * MemberKickedEvent를 수신하여 MEETING 알림 구독 중인 강퇴된 사용자에게 Alert 푸시를 전송합니다.
 * - G2: {모임 이름} 모임에서 내보내졌어요 · 모임장에 의해 모임에서 제외되었습니다
 */
@Injectable()
export class MemberKickedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(MemberKickedPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: MemberKickedEvent) => void this.handle(event),
      MemberKickedEvent.name,
    );
  }

  async handle(event: MemberKickedEvent): Promise<void> {
    const { groupId, groupName, kickedUserId } = event.metadata;

    const result =
      await this.pushDispatchService.sendAlertPushToTargetSubscribers({
        userIds: [kickedUserId],
        type: AlertPushType.Meeting,
        topic: 'member-kicked',
        notification: {
          title: `${groupName} 모임에서 내보내졌어요`,
          body: '모임장에 의해 모임에서 제외되었습니다',
        },
        data: {
          targetScreen: 'home',
          groupId,
        },
      });

    if (!result.sent) {
      this.logger.warn(`멤버 강퇴 푸시 발송 대상 없음: groupId=${groupId}`);
      return;
    }

    this.logger.log(
      `멤버 강퇴 Alert 푸시 발송 완료: groupId=${groupId}, kickedUserId=${kickedUserId}`,
    );
  }
}
