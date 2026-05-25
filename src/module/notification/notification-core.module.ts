import { Module } from '@nestjs/common';
import {
  NotificationRepository,
  NotificationUserRepository,
  SystemNotificationRepository,
  NotificationSubscriptionRepository,
} from './domain/repositories';
import {
  NotificationQueryService,
  NotificationSubscriptionQueryService,
} from './domain/services';
import {
  NotificationRepositoryImpl,
  NotificationUserRepositoryImpl,
  SystemNotificationRepositoryImpl,
  NotificationSubscriptionRepositoryImpl,
} from './infra/repositories';
import {
  NotificationQueryServiceImpl,
  NotificationSubscriptionQueryServiceImpl,
} from './infra/services';

@Module({
  providers: [
    {
      provide: NotificationRepository,
      useClass: NotificationRepositoryImpl,
    },
    {
      provide: NotificationQueryService,
      useClass: NotificationQueryServiceImpl,
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
      provide: NotificationSubscriptionQueryService,
      useClass: NotificationSubscriptionQueryServiceImpl,
    },
  ],
  exports: [
    NotificationRepository,
    NotificationQueryService,
    NotificationUserRepository,
    SystemNotificationRepository,
    NotificationSubscriptionRepository,
    NotificationSubscriptionQueryService,
  ],
})
export class NotificationCoreModule {}
