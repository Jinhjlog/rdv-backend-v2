import { Module } from '@nestjs/common';
import {
  CharacterRepository,
  UserCharacterRepository,
} from './domain/repositories';
import {
  UnlockConditionResolver,
  UNLOCK_CONDITION_RESOLVER,
  CharacterQueryService,
  UserLookupService,
} from './domain/services';
import {
  CharacterRepositoryImpl,
  UserCharacterRepositoryImpl,
} from './infra/repositories';
import {
  CharacterQueryServiceImpl,
  UserLookupServiceImpl,
  UNLOCK_CONDITION_RESOLVER_CLASSES,
} from './infra/services';

/**
 * Character Core 모듈
 *
 * Domain과 Infrastructure 레이어의 Repository/Service를 등록하고 export합니다.
 */
@Module({
  providers: [
    {
      provide: CharacterRepository,
      useClass: CharacterRepositoryImpl,
    },
    {
      provide: UserCharacterRepository,
      useClass: UserCharacterRepositoryImpl,
    },
    {
      provide: CharacterQueryService,
      useClass: CharacterQueryServiceImpl,
    },
    {
      provide: UserLookupService,
      useClass: UserLookupServiceImpl,
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
    UserCharacterRepository,
    CharacterQueryService,
    UserLookupService,
    UNLOCK_CONDITION_RESOLVER,
  ],
})
export class CharacterCoreModule {}
