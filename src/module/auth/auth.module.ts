import { Global, Module, Provider } from '@nestjs/common';
import {
  JwtBlacklistCheckGuard,
  UserJwtAuthGuard,
  ApiKeyGuard,
  AdminApiKeyGuard,
  AttestationGuard,
  CloudTasksAuthGuard,
} from './guards';
import { UserJwtStrategy } from './strategies';
import {
  UserRepository,
  UserRepositoryImpl,
  AttestationServiceImpl,
} from './infra';
import { AttestationService } from './services/attestation.service';

const useCases: Provider[] = [];
const guards: Provider[] = [
  UserJwtAuthGuard,
  JwtBlacklistCheckGuard,
  ApiKeyGuard,
  AdminApiKeyGuard,
  AttestationGuard,
  CloudTasksAuthGuard,
];

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
    {
      provide: AttestationService,
      useClass: AttestationServiceImpl,
    },
  ],
  exports: [UserJwtStrategy, ...guards, UserRepository, AttestationService],
})
export class AuthModule {}
