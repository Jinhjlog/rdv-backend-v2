import { Module, Provider } from '@nestjs/common';
import {
  CharactersRepositoryImpl,
  UserQueryRepositoryImpl,
  UserRepositoryImpl,
} from './infra/repositories';
import {
  ChangeCharacterUseCase,
  CheckAccountExistsUseCase,
  FindUserUseCase,
  LoginUseCase,
  RegisterUseCase,
} from './application/usecases';
import { AuthController, UserController } from './presentation/controllers';
import {
  CharactersRepository,
  UserQueryRepository,
  UserRepository,
} from './domain/repositories';
import { JwtModule } from '@core/jwt/jwt.module';
import { AuthService } from './domain/services/auth.service';

const useCases: Provider[] = [
  ChangeCharacterUseCase,
  CheckAccountExistsUseCase,
  LoginUseCase,
  RegisterUseCase,
  FindUserUseCase,
];

@Module({
  imports: [JwtModule],
  controllers: [AuthController, UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: CharactersRepository,
      useClass: CharactersRepositoryImpl,
    },
    {
      provide: UserQueryRepository,
      useClass: UserQueryRepositoryImpl,
    },
    AuthService,
    ...useCases,
  ],
})
export class UserModule {}
