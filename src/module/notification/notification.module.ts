import { Module, Provider } from '@nestjs/common';
import { NotificationCoreModule } from './notification-core.module';
import { NotificationController } from './presentation/controllers';
import {
  GetNotificationListUseCase,
  GetUnreadCountUseCase,
  ReadNotificationUseCase,
  ReadAllNotificationsUseCase,
} from './application/usecases';

const useCases: Provider[] = [
  GetNotificationListUseCase,
  GetUnreadCountUseCase,
  ReadNotificationUseCase,
  ReadAllNotificationsUseCase,
];

/**
 * Notification 모듈
 *
 * 사용자 알림 API를 제공합니다.
 */
@Module({
  imports: [NotificationCoreModule],
  controllers: [NotificationController],
  providers: [...useCases],
})
export class NotificationModule {}
