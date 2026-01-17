import { Module } from '@nestjs/common';
import { InviteCodeRepository } from './domain';
import { InviteCodeRepositoryImpl } from './infra';

@Module({
  providers: [
    {
      provide: InviteCodeRepository,
      useClass: InviteCodeRepositoryImpl,
    },
  ],
  exports: [InviteCodeRepository],
})
export class InviteCodeCoreModule {}
