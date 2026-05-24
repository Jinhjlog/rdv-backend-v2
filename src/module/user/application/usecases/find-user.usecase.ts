import { Injectable } from '@nestjs/common';
import { UserQueryService } from '../../domain/services';
import { FindUserDto } from '../dtos';
import { UserReadModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly userQueryService: UserQueryService) {}

  async execute(dto: FindUserDto): Promise<UserReadModel> {
    const user = await this.userQueryService.findById(dto.userId);
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
