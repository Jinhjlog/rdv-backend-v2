import { Module, Provider } from '@nestjs/common';
import {
  CharactersRepositoryImpl,
  UserRepositoryImpl,
} from './infra/repositories';
import {
  CheckAccountExistsUseCase,
  LoginUseCase,
  RegisterUseCase,
} from './application/usecases';
import { AuthController } from './presentation/controllers';
import { CharactersRepository, UserRepository } from './domain/repositories';
import { JwtModule } from '@core/jwt/jwt.module';
import { AuthService } from './domain/services/auth.service';

const useCases: Provider[] = [
  CheckAccountExistsUseCase,
  LoginUseCase,
  RegisterUseCase,
];

@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: CharactersRepository,
      useClass: CharactersRepositoryImpl,
    },
    AuthService,
    ...useCases,
  ],
})
export class UserModule {}
