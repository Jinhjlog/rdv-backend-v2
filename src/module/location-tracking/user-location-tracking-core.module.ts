import { Module, Provider } from '@nestjs/common';
import {
  CreateLocationTrackingUseCase,
  FindLocationsByEventUseCase,
  UpdateLocationUseCase,
} from './application/usecases';
import { ParticipantDepartedEventHandler } from './application/handlers';
import { LocationTrackingController } from './presentation';
import { LocationTrackingCoreModule } from './location-tracking-core.module';

const useCases: Provider[] = [
  CreateLocationTrackingUseCase,
  FindLocationsByEventUseCase,
  UpdateLocationUseCase,
];

const eventHandlers: Provider[] = [ParticipantDepartedEventHandler];

@Module({
  imports: [LocationTrackingCoreModule],
  controllers: [LocationTrackingController],
  providers: [...useCases, ...eventHandlers],
})
export class UserLocationTrackingCoreModule {}
