import { Module } from '@nestjs/common';
import {
  CharacterRepository,
  CharacterQueryRepository,
  UserCharacterRepository,
  UserRepository,
} from './domain/repositories';
import {
  UnlockConditionResolver,
  UNLOCK_CONDITION_RESOLVER,
} from './domain/services';
import {
  CharacterRepositoryImpl,
  CharacterQueryRepositoryImpl,
  UserCharacterRepositoryImpl,
  UserRepositoryImpl,
} from './infra/repositories';
import { UNLOCK_CONDITION_RESOLVER_CLASSES } from './infra/services';

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
    ...UNLOCK_CONDITION_RESOLVER_CLASSES,
    {
      provide: UNLOCK_CONDITION_RESOLVER,
      useFactory: (...resolvers: UnlockConditionResolver[]) => resolvers,
      inject: UNLOCK_CONDITION_RESOLVER_CLASSES,
    },
  ],
  exports: [
    CharacterRepository,
    CharacterQueryRepository,
    UserCharacterRepository,
    UserRepository,
    UNLOCK_CONDITION_RESOLVER,
  ],
})
export class CharacterCoreModule {}
