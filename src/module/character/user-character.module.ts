import { Module, Provider } from '@nestjs/common';
import { CharacterCoreModule } from './character-core.module';
import { UserCharacterController } from './presentation/controllers';
import {
  FindCharacterListUseCase,
  UnlockCharacterUseCase,
} from './application/usecases';
import { UserRegisteredEventHandler } from './application/handlers';

const useCases: Provider[] = [FindCharacterListUseCase, UnlockCharacterUseCase];

/**
 * Character User 모듈
 *
 * 사용자 역할을 위한 Character API를 제공합니다.
 */
@Module({
  imports: [CharacterCoreModule],
  controllers: [UserCharacterController],
  providers: [...useCases, UserRegisteredEventHandler],
})
export class UserCharacterModule {}
