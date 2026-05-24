import { Module, Provider } from '@nestjs/common';
import { CharactersRepositoryImpl, UserRepositoryImpl } from './infra/repositories';
import {
  UserQueryServiceImpl,
  AttendanceStatisticsQueryServiceImpl,
} from './infra/services';
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
import { CharactersRepository, UserRepository } from './domain/repositories';
import {
  UserQueryService,
  AttendanceStatisticsQueryService,
} from './domain/services';
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
      provide: UserQueryService,
      useClass: UserQueryServiceImpl,
    },
    {
      provide: AttendanceStatisticsQueryService,
      useClass: AttendanceStatisticsQueryServiceImpl,
    },
    AuthService,
    ...useCases,
  ],
})
export class UserModule {}
