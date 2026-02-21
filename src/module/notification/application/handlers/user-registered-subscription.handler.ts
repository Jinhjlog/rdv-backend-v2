import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { UserRegisteredEvent } from 'src/module/user/domain/events';
import { NotificationSubscriptionRepository } from '../../domain/repositories';
import { NotificationSubscription } from '../../domain/models/notification-subscription/notification-subscription';

/**
 * 회원가입 알림 구독 초기화 핸들러
 *
 * UserRegisteredEvent를 수신하여 신규 유저의 모든 알림 타입 구독 설정을 기본값(구독)으로 생성합니다.
 */
@Injectable()
export class UserRegisteredSubscriptionHandler implements OnModuleInit {
  constructor(
    private readonly notificationSubscriptionRepository: NotificationSubscriptionRepository,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: UserRegisteredEvent) => void this.handle(event),
      UserRegisteredEvent.name,
    );
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    const userId = event.userId.toString();
    const subscriptions = NotificationSubscription.createAll(userId);
    await this.notificationSubscriptionRepository.saveBatch(subscriptions);
  }
}
