import { Module, Provider } from '@nestjs/common';
import { GroupCoreModule } from './group-core.module';
import {
  CreateGroupUseCase,
  FindGroupListUseCase,
  FindGroupDetailUseCase,
} from './application/usecases';
import { UserGroupController } from './presentation/controllers';

const useCases: Provider[] = [
  CreateGroupUseCase,
  FindGroupListUseCase,
  FindGroupDetailUseCase,
];

@Module({
  imports: [GroupCoreModule],
  controllers: [UserGroupController],
  providers: [...useCases],
  exports: [],
})
export class UserGroupModule {}
