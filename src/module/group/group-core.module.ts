import { Module } from '@nestjs/common';
import {
  GroupRepository,
  ShortTalkSessionRepository,
  ChatMessageRepository,
} from './domain/repositories';
import {
  GroupQueryService,
  ChatMessageQueryService,
  ShortTalkUserQueryService,
  EventLookupService,
  GroupLeavePolicyService,
} from './domain/services';
import {
  GroupRepositoryImpl,
  ShortTalkSessionRepositoryImpl,
  ChatMessageRepositoryImpl,
} from './infra/repositories';
import {
  GroupQueryServiceImpl,
  ChatMessageQueryServiceImpl,
  ShortTalkUserQueryServiceImpl,
  EventLookupServiceImpl,
} from './infra/services';

@Module({
  providers: [
    {
      provide: GroupRepository,
      useClass: GroupRepositoryImpl,
    },
    {
      provide: ShortTalkSessionRepository,
      useClass: ShortTalkSessionRepositoryImpl,
    },
    {
      provide: ChatMessageRepository,
      useClass: ChatMessageRepositoryImpl,
    },
    {
      provide: GroupQueryService,
      useClass: GroupQueryServiceImpl,
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
      provide: EventLookupService,
      useClass: EventLookupServiceImpl,
    },
    GroupLeavePolicyService,
  ],
  exports: [
    GroupRepository,
    ShortTalkSessionRepository,
    ChatMessageRepository,
    GroupQueryService,
    ChatMessageQueryService,
    ShortTalkUserQueryService,
    EventLookupService,
    GroupLeavePolicyService,
  ],
})
export class GroupCoreModule {}
