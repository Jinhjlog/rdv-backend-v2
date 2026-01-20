import { Module, Provider } from '@nestjs/common';
import {
  FindLocationsByEventUseCase,
  UpdateLocationUseCase,
} from './application/usecases';
import { LocationTrackingController } from './presentation';
import { LocationTrackingCoreModule } from './location-tracking-core.module';

const useCases: Provider[] = [FindLocationsByEventUseCase, UpdateLocationUseCase];

@Module({
  imports: [LocationTrackingCoreModule],
  controllers: [LocationTrackingController],
  providers: [...useCases],
})
export class UserLocationTrackingCoreModule {}
