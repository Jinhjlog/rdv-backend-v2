import { Module } from '@nestjs/common';
import {
  GroupRepository,
  GroupQueryRepository,
  ShortTalkSessionRepository,
  ChatMessageRepository,
  ChatMessageQueryRepository,
  ShortTalkUserQueryRepository,
} from './domain/repositories';
import {
  GroupRepositoryImpl,
  GroupQueryRepositoryImpl,
  ShortTalkSessionRepositoryImpl,
  ChatMessageRepositoryImpl,
  ChatMessageQueryRepositoryImpl,
  ShortTalkUserQueryRepositoryImpl,
} from './infra/repositories';

/**
 * Group Core 모듈
 *
 * Domain과 Infrastructure 레이어의 Repository를 등록하고 export합니다.
 */
@Module({
  providers: [
    {
      provide: GroupRepository,
      useClass: GroupRepositoryImpl,
    },
    {
      provide: GroupQueryRepository,
      useClass: GroupQueryRepositoryImpl,
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
      provide: ChatMessageQueryRepository,
      useClass: ChatMessageQueryRepositoryImpl,
    },
    {
      provide: ShortTalkUserQueryRepository,
      useClass: ShortTalkUserQueryRepositoryImpl,
    },
  ],
  exports: [
    GroupRepository,
    GroupQueryRepository,
    ShortTalkSessionRepository,
    ChatMessageRepository,
    ChatMessageQueryRepository,
    ShortTalkUserQueryRepository,
  ],
})
export class GroupCoreModule {}
