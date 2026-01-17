import { Module } from '@nestjs/common';
import {
  CharacterRepository,
  CharacterQueryRepository,
} from './domain/repositories';
import {
  CharacterRepositoryImpl,
  CharacterQueryRepositoryImpl,
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
  ],
  exports: [CharacterRepository, CharacterQueryRepository],
})
export class CharacterCoreModule {}
