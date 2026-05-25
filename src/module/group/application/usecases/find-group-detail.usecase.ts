import { Injectable } from '@nestjs/common';
import { GroupQueryService } from '../../domain/services';
import { GroupDetailReadModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';
import { FindGroupDetailDto } from '../dtos';

@Injectable()
export class FindGroupDetailUseCase {
  constructor(private readonly groupQueryService: GroupQueryService) {}

  async execute(dto: FindGroupDetailDto): Promise<GroupDetailReadModel> {
    const group = await this.groupQueryService.findDetail({
      groupId: dto.groupId,
    });
    if (!group) {
      throw new EntityNotFoundException({
        entityName: 'Group',
        errorCode: 'GROUP_NOT_FOUND',
        id: dto.groupId,
      });
    }

    return group;
  }
}
