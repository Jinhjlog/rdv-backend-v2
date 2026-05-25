import { Module } from '@nestjs/common';
import {
  ShortTalkSessionRepository,
  ChatMessageRepository,
} from './domain/repositories';
import {
  ChatMessageQueryService,
  ShortTalkUserQueryService,
  GroupMembershipLookupService,
} from './domain/services';
import {
  ShortTalkSessionRepositoryImpl,
  ChatMessageRepositoryImpl,
} from './infra/repositories';
import {
  ChatMessageQueryServiceImpl,
  ShortTalkUserQueryServiceImpl,
  GroupMembershipLookupServiceImpl,
} from './infra/services';

@Module({
  providers: [
    {
      provide: ShortTalkSessionRepository,
      useClass: ShortTalkSessionRepositoryImpl,
    },
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
  ],
  exports: [
    ShortTalkSessionRepository,
    ChatMessageRepository,
    ChatMessageQueryService,
    ShortTalkUserQueryService,
    GroupMembershipLookupService,
  ],
})
export class ShortTalkCoreModule {}
