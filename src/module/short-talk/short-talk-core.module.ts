import { Module } from '@nestjs/common';
import { ChatMessageRepository } from './domain/repositories';
import {
  ChatMessageQueryService,
  ShortTalkUserQueryService,
  GroupMembershipLookupService,
} from './domain/services';
import { SseConnectionPort } from './application/ports';
import { ChatMessageRepositoryImpl } from './infra/repositories';
import {
  ChatMessageQueryServiceImpl,
  ShortTalkUserQueryServiceImpl,
  GroupMembershipLookupServiceImpl,
} from './infra/services';
import { SseConnectionAdapter } from './infra/adapters';

@Module({
  providers: [
    {
      provide: ChatMessageRepository,
      useClass: ChatMessageRepositoryImpl,
    },
    {
      provide: ChatMessageQueryService,
      useClass: ChatMessageQueryServiceImpl,
    },
    {
      provide: ShortTalkUserQueryService,
      useClass: ShortTalkUserQueryServiceImpl,
    },
    {
      provide: GroupMembershipLookupService,
      useClass: GroupMembershipLookupServiceImpl,
    },
    {
      provide: SseConnectionPort,
      useClass: SseConnectionAdapter,
    },
  ],
  exports: [
    ChatMessageRepository,
    ChatMessageQueryService,
    ShortTalkUserQueryService,
    GroupMembershipLookupService,
    SseConnectionPort,
  ],
})
export class ShortTalkCoreModule {}
