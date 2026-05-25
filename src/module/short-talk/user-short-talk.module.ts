import { Module, Provider } from '@nestjs/common';
import { ShortTalkCoreModule } from './short-talk-core.module';
import {
  JoinShortTalkUseCase,
  LeaveShortTalkUseCase,
  SendShortTalkMessageUseCase,
  GetChatMessageListUseCase,
} from './application/usecases';
import { ShortTalkController } from './presentation/controllers';

const useCases: Provider[] = [
  JoinShortTalkUseCase,
  LeaveShortTalkUseCase,
  SendShortTalkMessageUseCase,
  GetChatMessageListUseCase,
];

@Module({
  imports: [ShortTalkCoreModule],
  controllers: [ShortTalkController],
  providers: [...useCases],
})
export class UserShortTalkModule {}
