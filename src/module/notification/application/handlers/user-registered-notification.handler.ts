import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { UserRegisteredEvent } from 'src/module/user/domain/events';
import { NotificationRepository } from '../../domain/repositories';
import { Notification, NotificationType } from '../../domain/models';

/**
 * 회원가입 완료 알림 핸들러
 *
 * UserRegisteredEvent를 수신하여 신규 유저에게 웰컴 알림을 생성합니다.
 * 푸시 전송 없이 인앱 알림함에만 저장합니다.
 */
@Injectable()
export class UserRegisteredNotificationHandler implements OnModuleInit {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: UserRegisteredEvent) => void this.handle(event),
      UserRegisteredEvent.name,
    );
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    const userId = event.userId.toString();

    const notification = Notification.create({
      userId,
      type: NotificationType.create('ATTENDANCE'),
      title: '👋 어디개에 오신 걸 환영해요!',
      subtitle: '어디개에서 친구들과의 약속을 더 편하게 잡아보세요.',
    });

    await this.notificationRepository.save(notification);
  }
}
