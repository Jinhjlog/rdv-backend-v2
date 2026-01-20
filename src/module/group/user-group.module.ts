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
  JoinShortTalkUseCase,
  LeaveShortTalkUseCase,
  SendShortTalkMessageUseCase,
  GetChatMessageListUseCase,
} from './application/usecases';
import {
  UserGroupController,
  ShortTalkController,
} from './presentation/controllers';
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
  JoinShortTalkUseCase,
  LeaveShortTalkUseCase,
  SendShortTalkMessageUseCase,
  GetChatMessageListUseCase,
];

@Module({
  imports: [GroupCoreModule, InviteCodeCoreModule],
  controllers: [UserGroupController, ShortTalkController],
  providers: [...useCases],
  exports: [],
})
export class UserGroupModule {}
