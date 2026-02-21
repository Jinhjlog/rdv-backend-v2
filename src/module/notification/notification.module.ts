import { Module, Provider } from '@nestjs/common';
import { NotificationCoreModule } from './notification-core.module';
import {
  NotificationController,
  AdminNotificationController,
} from './presentation/controllers';
import {
  GetNotificationListUseCase,
  GetUnreadCountUseCase,
  ReadNotificationUseCase,
  ReadAllNotificationsUseCase,
  BroadcastSystemNotificationUseCase,
  GetNotificationSubscriptionsUseCase,
  UpdateNotificationSubscriptionUseCase,
} from './application/usecases';
import {
  UserRegisteredNotificationHandler,
  UserRegisteredSubscriptionHandler,
  EventCreatedNotificationHandler,
  EventCancelledNotificationHandler,
  EventEndedNotificationHandler,
  MemberKickedNotificationHandler,
} from './application/handlers';

const useCases: Provider[] = [
  GetNotificationListUseCase,
  GetUnreadCountUseCase,
  ReadNotificationUseCase,
  ReadAllNotificationsUseCase,
  BroadcastSystemNotificationUseCase,
  GetNotificationSubscriptionsUseCase,
  UpdateNotificationSubscriptionUseCase,
];

const handlers: Provider[] = [
  UserRegisteredNotificationHandler,
  UserRegisteredSubscriptionHandler,
  EventCreatedNotificationHandler,
  EventCancelledNotificationHandler,
  EventEndedNotificationHandler,
  MemberKickedNotificationHandler,
];

/**
 * Notification 모듈
 *
 * 사용자 알림 API 및 관리자 공지 브로드캐스트 API를 제공합니다.
 */
@Module({
  imports: [NotificationCoreModule],
  controllers: [NotificationController, AdminNotificationController],
  providers: [...useCases, ...handlers],
})
export class NotificationModule {}
