import { Module } from '@nestjs/common';
import {
  CharacterRepository,
  CharacterQueryRepository,
  UserCharacterRepository,
  UserRepository,
} from './domain/repositories';
import {
  CharacterRepositoryImpl,
  CharacterQueryRepositoryImpl,
  UserCharacterRepositoryImpl,
  UserRepositoryImpl,
} from './infra/repositories';

/**
 * Character Core 모듈
 *
 * Domain과 Infrastructure 레이어의 Repository를 등록하고 export합니다.
 */
@Module({
  providers: [
    {
      provide: CharacterRepository,
      useClass: CharacterRepositoryImpl,
    },
    {
      provide: CharacterQueryRepository,
      useClass: CharacterQueryRepositoryImpl,
    },
    {
      provide: UserCharacterRepository,
      useClass: UserCharacterRepositoryImpl,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [
    CharacterRepository,
    CharacterQueryRepository,
    UserCharacterRepository,
    UserRepository,
  ],
})
export class CharacterCoreModule {}
