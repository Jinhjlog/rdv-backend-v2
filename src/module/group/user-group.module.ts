import { Module, Provider } from '@nestjs/common';
import { GroupCoreModule } from './group-core.module';
import { CreateGroupUseCase } from './application/usecases';
import { UserGroupController } from './presentation/controllers';

const useCases: Provider[] = [CreateGroupUseCase];

@Module({
  imports: [GroupCoreModule],
  controllers: [UserGroupController],
  providers: [...useCases],
  exports: [],
})
export class UserGroupModule {}
