import { Module, Provider } from '@nestjs/common';
import { PushDispatchService } from './application/services';
import {
  HandleFailedTokensUseCase,
  SendTestPushUseCase,
} from './application/usecases';
import {
  SystemNotificationPushHandler,
  EventStartedPushHandler,
  EventCreatedPushHandler,
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

const useCases: Provider[] = [HandleFailedTokensUseCase, SendTestPushUseCase];

const services: Provider[] = [PushDispatchService];

const handlers: Provider[] = [
  SystemNotificationPushHandler,
  EventStartedPushHandler,
  EventCreatedPushHandler,
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
    ...useCases,
    ...services,
    ...handlers,
  ],
})
export class PushNotificationModule {}
