import { Module } from '@nestjs/common';
import { GroupRepository } from './domain/repositories';
import {
  GroupQueryService,
  EventLookupService,
  GroupLeavePolicyService,
} from './domain/services';
import { GroupRepositoryImpl } from './infra/repositories';
import {
  GroupQueryServiceImpl,
  EventLookupServiceImpl,
} from './infra/services';

@Module({
  providers: [
    {
      provide: GroupRepository,
      useClass: GroupRepositoryImpl,
    },
    {
      provide: GroupQueryService,
      useClass: GroupQueryServiceImpl,
    },
    {
      provide: EventLookupService,
      useClass: EventLookupServiceImpl,
    },
    GroupLeavePolicyService,
  ],
  exports: [
    GroupRepository,
    GroupQueryService,
    EventLookupService,
    GroupLeavePolicyService,
  ],
})
export class GroupCoreModule {}
