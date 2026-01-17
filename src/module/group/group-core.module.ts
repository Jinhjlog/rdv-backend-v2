import { Module } from '@nestjs/common';
import { GroupRepository } from './domain/repositories';
import { GroupRepositoryImpl } from './infra/repositories';

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
  ],
  exports: [GroupRepository],
})
export class GroupCoreModule {}
