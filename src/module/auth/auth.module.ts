import { Global, Module, Provider } from '@nestjs/common';
import { JwtBlacklistCheckGuard, UserJwtAuthGuard } from './guards';
import { UserJwtStrategy } from './strategies';
import { UserRepository, UserRepositoryImpl } from './infra';

const useCases: Provider[] = [];
const guards: Provider[] = [UserJwtAuthGuard, JwtBlacklistCheckGuard];

@Global()
@Module({
  controllers: [],
  providers: [
    UserJwtStrategy,
    ...guards,
    ...useCases,
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UserJwtStrategy, ...guards, UserRepository],
})
export class AuthModule {}
