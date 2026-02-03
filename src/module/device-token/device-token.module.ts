import { Module, Provider } from '@nestjs/common';
import { DeviceTokenRepositoryImpl } from './infra/repositories';
import {
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  CleanupStaleTokensUseCase,
  HandleFailedTokensUseCase,
  SendTestPushUseCase,
} from './application/usecases';
import {
  EventStartedPushHandler,
  CharacterUnlockedPushHandler,
} from './application/handlers';
import { DeviceTokenController } from './presentation/controllers';
import { DeviceTokenRepository } from './domain/repositories';
import { TokenCleanupScheduler } from './infra/schedulers';

const useCases: Provider[] = [
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  CleanupStaleTokensUseCase,
  HandleFailedTokensUseCase,
  SendTestPushUseCase,
];

const handlers: Provider[] = [
  EventStartedPushHandler,
  CharacterUnlockedPushHandler,
];

@Module({
  controllers: [DeviceTokenController],
  providers: [
    {
      provide: DeviceTokenRepository,
      useClass: DeviceTokenRepositoryImpl,
    },
    TokenCleanupScheduler,
    ...useCases,
    ...handlers,
  ],
})
export class DeviceTokenModule {}
