import { Module, Provider } from '@nestjs/common';
import { EventCoreModule } from './event-core.module';
import {
  FindEventListUseCase,
  FindEventDetailUseCase,
  CreateEventUseCase,
  JoinEventUseCase,
} from './application/usecases';
import { UserEventController } from './presentation/controllers';

const useCases: Provider[] = [
  FindEventListUseCase,
  FindEventDetailUseCase,
  CreateEventUseCase,
  JoinEventUseCase,
];

@Module({
  imports: [EventCoreModule],
  controllers: [UserEventController],
  providers: [...useCases],
})
export class UserEventModule {}
