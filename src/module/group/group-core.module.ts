import { Module } from '@nestjs/common';
import { GroupRepository, GroupQueryRepository } from './domain/repositories';
import {
  GroupRepositoryImpl,
  GroupQueryRepositoryImpl,
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
  ],
  exports: [GroupRepository, GroupQueryRepository],
})
export class GroupCoreModule {}
