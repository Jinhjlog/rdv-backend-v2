import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { MemberKickedEvent } from 'src/module/group/domain/events';
import { NotificationRepository } from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/models';

/**
 * 멤버 강퇴 알림 핸들러
 *
 * MemberKickedEvent를 수신하여 강퇴된 사용자에게 인앱 알림을 생성합니다.
 * - G2: {모임 이름} 모임에서 내보내졌어요 · 모임장에 의해 모임에서 제외되었습니다
 */
@Injectable()
export class MemberKickedNotificationHandler implements OnModuleInit {
  private readonly logger = new Logger(MemberKickedNotificationHandler.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: MemberKickedEvent) => void this.handle(event),
      MemberKickedEvent.name,
    );
  }

  async handle(event: MemberKickedEvent): Promise<void> {
    const { groupId, groupName, kickedUserId } = event.metadata;

    const notification = Notification.create({
      userId: kickedUserId,
      type: NotificationType.create('MEETING'),
      title: `${groupName} 모임에서 내보내졌어요`,
      subtitle: '모임장에 의해 모임에서 제외되었습니다',
    });

    await this.notificationRepository.save(notification);

    this.logger.log(
      `멤버 강퇴 알림 저장 완료: groupId=${groupId}, kickedUserId=${kickedUserId}`,
    );
  }
}
