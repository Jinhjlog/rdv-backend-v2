import { Module, Provider } from '@nestjs/common';
import {
  CharactersRepositoryImpl,
  UserQueryRepositoryImpl,
  UserRepositoryImpl,
  AttendanceStatisticsQueryRepositoryImpl,
} from './infra/repositories';
import {
  ChangeCharacterUseCase,
  CheckAccountExistsUseCase,
  FindUserUseCase,
  LoginUseCase,
  RegisterUseCase,
  GetUserAttendanceStatisticsUseCase,
} from './application/usecases';
import {
  AuthController,
  AuthV2Controller,
  UserController,
} from './presentation/controllers';
import {
  CharactersRepository,
  UserQueryRepository,
  UserRepository,
  AttendanceStatisticsQueryRepository,
} from './domain/repositories';
import { JwtModule } from '@core/jwt/jwt.module';
import { AuthService } from './domain/services/auth.service';

const useCases: Provider[] = [
  ChangeCharacterUseCase,
  CheckAccountExistsUseCase,
  LoginUseCase,
  RegisterUseCase,
  FindUserUseCase,
  GetUserAttendanceStatisticsUseCase,
];

@Module({
  imports: [JwtModule],
  controllers: [AuthController, AuthV2Controller, UserController],
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
    {
      provide: AttendanceStatisticsQueryRepository,
      useClass: AttendanceStatisticsQueryRepositoryImpl,
    },
    AuthService,
    ...useCases,
  ],
})
export class UserModule {}
