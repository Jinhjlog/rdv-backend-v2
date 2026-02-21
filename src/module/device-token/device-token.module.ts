import { Module, Provider } from '@nestjs/common';
import {
  DeviceTokenRepositoryImpl,
  SubscriptionFilterRepositoryImpl,
} from './infra/repositories';
import {
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  CleanupStaleTokensUseCase,
  HandleFailedTokensUseCase,
  SendTestPushUseCase,
} from './application/usecases';
import { PushDispatchService } from './application/services';
import {
  EventStartedPushHandler,
  CharacterUnlockedPushHandler,
  SystemNotificationPushHandler,
} from './application/handlers';
import { DeviceTokenController } from './presentation/controllers';
import {
  DeviceTokenRepository,
  SubscriptionFilterRepository,
} from './domain/repositories';
import { TokenCleanupScheduler } from './infra/schedulers';

const useCases: Provider[] = [
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  CleanupStaleTokensUseCase,
  HandleFailedTokensUseCase,
  SendTestPushUseCase,
];

const services: Provider[] = [PushDispatchService];

const handlers: Provider[] = [
  EventStartedPushHandler,
  CharacterUnlockedPushHandler,
  SystemNotificationPushHandler,
];

@Module({
  controllers: [DeviceTokenController],
  providers: [
    {
      provide: DeviceTokenRepository,
      useClass: DeviceTokenRepositoryImpl,
    },
    {
      provide: SubscriptionFilterRepository,
      useClass: SubscriptionFilterRepositoryImpl,
    },
    TokenCleanupScheduler,
    ...useCases,
    ...services,
    ...handlers,
  ],
})
export class DeviceTokenModule {}
