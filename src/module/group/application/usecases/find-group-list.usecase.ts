import { Injectable } from '@nestjs/common';
import { GroupQueryService } from '../../domain/services';
import { FindGroupListDto } from '../dtos';
import { GroupListReadModel } from '../../domain';

@Injectable()
export class FindGroupListUseCase {
  constructor(private readonly groupQueryService: GroupQueryService) {}

  async execute(dto: FindGroupListDto): Promise<GroupListReadModel[]> {
    return this.groupQueryService.findList({
      contextUserId: dto.userId,
    });
  }
}
