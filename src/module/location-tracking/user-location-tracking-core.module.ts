import { Module, Provider } from '@nestjs/common';
import { UpdateLocationUseCase } from './application/usecases';
import { LocationTrackingController } from './presentation';
import { LocationTrackingCoreModule } from './location-tracking-core.module';

const useCases: Provider[] = [UpdateLocationUseCase];

@Module({
  imports: [LocationTrackingCoreModule],
  controllers: [LocationTrackingController],
  providers: [...useCases],
})
export class UserLocationTrackingCoreModule {}
