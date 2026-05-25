import { Module, Provider } from '@nestjs/common';
import { PushDispatchService } from './application/services';
import { NotificationSenderPort } from './application/ports';
import {
  HandleFailedTokensUseCase,
  SendTestPushUseCase,
} from './application/usecases';
import {
  SystemNotificationPushHandler,
  EventCreatedPushHandler,
  EventStartedPushHandler,
  EventCancelledPushHandler,
  EventEndedPushHandler,
  MemberKickedPushHandler,
  CharacterUnlockedPushHandler,
} from './application/handlers';
import { PushNotificationController } from './presentation/controllers';
import {
  PushTokenRepository,
  SubscriptionFilterRepository,
} from './domain/repositories';
import {
  PushTokenRepositoryImpl,
  SubscriptionFilterRepositoryImpl,
} from './infra/repositories';
import {
  FcmNotificationSenderAdapter,
  MockNotificationSenderAdapter,
} from './infra/adapters';

const isTest = process.env.NODE_ENV === 'test';

const useCases: Provider[] = [HandleFailedTokensUseCase, SendTestPushUseCase];

const services: Provider[] = [PushDispatchService];

const handlers: Provider[] = [
  SystemNotificationPushHandler,
  EventCreatedPushHandler,
  EventStartedPushHandler,
  EventCancelledPushHandler,
  EventEndedPushHandler,
  MemberKickedPushHandler,
  CharacterUnlockedPushHandler,
];

@Module({
  controllers: [PushNotificationController],
  providers: [
    {
      provide: PushTokenRepository,
      useClass: PushTokenRepositoryImpl,
    },
    {
      provide: SubscriptionFilterRepository,
      useClass: SubscriptionFilterRepositoryImpl,
    },
    {
      provide: NotificationSenderPort,
      useClass: isTest
        ? MockNotificationSenderAdapter
        : FcmNotificationSenderAdapter,
    },
    ...useCases,
    ...services,
    ...handlers,
  ],
})
export class PushNotificationModule {}
