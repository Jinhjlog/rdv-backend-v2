import { Injectable } from '@nestjs/common';
import { GroupQueryRepository } from '../../domain/repositories';
import { FindGroupListDto } from '../dtos';
import { GroupListItemQueryModel } from '../../domain';

@Injectable()
export class FindGroupListUseCase {
  constructor(private readonly groupQueryRepository: GroupQueryRepository) {}

  async execute(dto: FindGroupListDto): Promise<GroupListItemQueryModel[]> {
    return this.groupQueryRepository.findList({
      contextUserId: dto.userId,
    });
  }
}
