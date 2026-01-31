import { Module, Provider } from '@nestjs/common';
import { AppVersionRepositoryImpl } from './infra/repositories';
import {
  GetAppVersionUseCase,
  UpdateAppVersionUseCase,
} from './application/usecases';
import {
  AppVersionController,
  AdminAppVersionController,
} from './presentation/controllers';
import { AppVersionRepository } from './domain/repositories';

const useCases: Provider[] = [GetAppVersionUseCase, UpdateAppVersionUseCase];

@Module({
  controllers: [AppVersionController, AdminAppVersionController],
  providers: [
    {
      provide: AppVersionRepository,
      useClass: AppVersionRepositoryImpl,
    },
    ...useCases,
  ],
})
export class AppVersionModule {}
