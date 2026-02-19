import { Module } from '@nestjs/common';
import {
  NotificationRepository,
  NotificationQueryRepository,
} from './domain/repositories';
import {
  NotificationRepositoryImpl,
  NotificationQueryRepositoryImpl,
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
  ],
  exports: [NotificationRepository, NotificationQueryRepository],
})
export class NotificationCoreModule {}
