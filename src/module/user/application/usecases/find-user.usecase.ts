import { Injectable } from '@nestjs/common';
import { UserQueryRepository } from '../../domain/repositories';
import { FindUserDto } from '../dtos';
import { UserQueryModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute(dto: FindUserDto): Promise<UserQueryModel> {
    const user = await this.userQueryRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException({
        entityName: 'User',
        errorCode: 'USER_NOT_FOUND',
        id: dto.userId,
      });
    }

    return user;
  }
}
