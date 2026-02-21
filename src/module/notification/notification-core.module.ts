import { Module } from '@nestjs/common';
import {
  NotificationRepository,
  NotificationQueryRepository,
  NotificationUserRepository,
  SystemNotificationRepository,
  NotificationSubscriptionRepository,
  NotificationSubscriptionQueryRepository,
} from './domain/repositories';
import {
  NotificationRepositoryImpl,
  NotificationQueryRepositoryImpl,
  NotificationUserRepositoryImpl,
  SystemNotificationRepositoryImpl,
  NotificationSubscriptionRepositoryImpl,
  NotificationSubscriptionQueryRepositoryImpl,
} from './infra/repositories';

/**
 * Notification Core 모듈
 *
 * Domain과 Infrastructure 레이어의 Repository를 등록하고 export합니다.
 */
@Module({
  providers: [
    {
      provide: NotificationRepository,
      useClass: NotificationRepositoryImpl,
    },
    {
      provide: NotificationQueryRepository,
      useClass: NotificationQueryRepositoryImpl,
    },
    {
      provide: NotificationUserRepository,
      useClass: NotificationUserRepositoryImpl,
    },
    {
      provide: SystemNotificationRepository,
      useClass: SystemNotificationRepositoryImpl,
    },
    {
      provide: NotificationSubscriptionRepository,
      useClass: NotificationSubscriptionRepositoryImpl,
    },
    {
      provide: NotificationSubscriptionQueryRepository,
      useClass: NotificationSubscriptionQueryRepositoryImpl,
    },
  ],
  exports: [
    NotificationRepository,
    NotificationQueryRepository,
    NotificationUserRepository,
    SystemNotificationRepository,
    NotificationSubscriptionRepository,
    NotificationSubscriptionQueryRepository,
  ],
})
export class NotificationCoreModule {}
