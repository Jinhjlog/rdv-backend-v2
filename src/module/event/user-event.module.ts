import { Module, Provider } from '@nestjs/common';
import { EventCoreModule } from './event-core.module';
import {
  FindEventListUseCase,
  FindEventDetailUseCase,
  FindActiveEventUseCase,
  FindCalendarMarkedDatesUseCase,
  FindCalendarEventListUseCase,
  CreateEventUseCase,
  JoinEventUseCase,
  DepartEventUseCase,
  ArriveEventUseCase,
  WithdrawEventUseCase,
  UpdateEventUseCase,
  DeleteEventUseCase,
} from './application/usecases';
import { UserEventController } from './presentation/controllers';

const useCases: Provider[] = [
  FindEventListUseCase,
  FindEventDetailUseCase,
  FindActiveEventUseCase,
  FindCalendarMarkedDatesUseCase,
  FindCalendarEventListUseCase,
  CreateEventUseCase,
  JoinEventUseCase,
  DepartEventUseCase,
  ArriveEventUseCase,
  WithdrawEventUseCase,
  UpdateEventUseCase,
  DeleteEventUseCase,
];

@Module({
  imports: [EventCoreModule],
  controllers: [UserEventController],
  providers: [...useCases],
})
export class UserEventModule {}
