import { Module, Provider } from '@nestjs/common';
import { UserRepositoryImpl } from './infra/repositories';
import {
  CheckAccountExistsUseCase,
  LoginUseCase,
} from './application/usecases';
import { AuthController } from './presentation/controllers';
import { UserRepository } from './domain/repositories';
import { JwtModule } from '@core/jwt/jwt.module';
import { AuthService } from './domain/services/auth.service';

const useCases: Provider[] = [CheckAccountExistsUseCase, LoginUseCase];

@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    AuthService,
    ...useCases,
  ],
})
export class UserModule {}
