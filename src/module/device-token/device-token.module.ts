import { Module, Provider } from '@nestjs/common';
import { DeviceTokenRepositoryImpl } from './infra/repositories';
import {
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  CleanupStaleTokensUseCase,
} from './application/usecases';
import { DeviceTokenController } from './presentation/controllers';
import { DeviceTokenRepository } from './domain/repositories';
import { TokenValidationPort } from './application/ports';
import {
  FcmTokenValidationAdapter,
  MockTokenValidationAdapter,
} from './infra/adapters';
import { TokenCleanupScheduler } from './infra/schedulers';

const isTest = process.env.NODE_ENV === 'test';

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
    {
      provide: TokenValidationPort,
      useClass: isTest ? MockTokenValidationAdapter : FcmTokenValidationAdapter,
    },
    TokenCleanupScheduler,
    ...useCases,
  ],
})
export class DeviceTokenModule {}
