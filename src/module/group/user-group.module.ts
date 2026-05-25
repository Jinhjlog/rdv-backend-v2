import { Module, Provider } from '@nestjs/common';
import { GroupCoreModule } from './group-core.module';
import {
  CreateGroupUseCase,
  FindGroupListUseCase,
  FindGroupDetailUseCase,
  UpdateGroupUseCase,
  DeleteGroupUseCase,
  CreateInviteCodeUseCase,
  JoinGroupUseCase,
  RemoveMemberUseCase,
  LeaveGroupUseCase,
  TransferOwnershipUseCase,
  GetGroupMemberAttendanceStatisticsUseCase,
} from './application/usecases';
import { UserGroupController } from './presentation/controllers';
import { InviteCodeCoreModule } from './invite-code-core.module';

const useCases: Provider[] = [
  CreateGroupUseCase,
  FindGroupListUseCase,
  FindGroupDetailUseCase,
  UpdateGroupUseCase,
  DeleteGroupUseCase,
  CreateInviteCodeUseCase,
  JoinGroupUseCase,
  RemoveMemberUseCase,
  LeaveGroupUseCase,
  TransferOwnershipUseCase,
  GetGroupMemberAttendanceStatisticsUseCase,
];

@Module({
  imports: [GroupCoreModule, InviteCodeCoreModule],
  controllers: [UserGroupController],
  providers: [...useCases],
})
export class UserGroupModule {}
