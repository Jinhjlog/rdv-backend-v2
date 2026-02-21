import { Module, Provider } from '@nestjs/common';
import { DeviceTokenRepositoryImpl } from './infra/repositories';
import {
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  CleanupStaleTokensUseCase,
} from './application/usecases';
import { DeviceTokenController } from './presentation/controllers';
import { DeviceTokenRepository } from './domain/repositories';
import { TokenCleanupScheduler } from './infra/schedulers';

const useCases: Provider[] = [
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  CleanupStaleTokensUseCase,
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
  ],
})
export class DeviceTokenModule {}
