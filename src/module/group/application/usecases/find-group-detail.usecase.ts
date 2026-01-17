import { Injectable } from '@nestjs/common';
import { GroupQueryRepository } from '../../domain/repositories';
import { GroupDetailQueryModel } from '../../domain/models';
import { EntityNotFoundException } from '@shared/exception';
import { FindGroupDetailDto } from '../dtos';

@Injectable()
export class FindGroupDetailUseCase {
  constructor(private readonly groupQueryRepository: GroupQueryRepository) {}

  async execute(dto: FindGroupDetailDto): Promise<GroupDetailQueryModel> {
    const group = await this.groupQueryRepository.findDetail({
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
