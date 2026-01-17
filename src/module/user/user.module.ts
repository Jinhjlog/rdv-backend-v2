import { Module, Provider } from '@nestjs/common';
import { UserRepositoryImpl } from './infra/repositories';
import { CheckAccountExistsUseCase } from './application/usecases';
import { AuthController } from './presentation/controllers';
import { UserRepository } from './domain/repositories';

const useCases: Provider[] = [CheckAccountExistsUseCase];

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    ...useCases,
  ],
})
export class UserModule {}
