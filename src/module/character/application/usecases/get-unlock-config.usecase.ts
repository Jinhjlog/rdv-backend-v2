import { Injectable } from '@nestjs/common';
import { CharacterQueryRepository } from '../../domain/repositories';
import { GetUnlockConfigDto, GetUnlockConfigResultDto } from '../dtos';

@Injectable()
export class GetUnlockConfigUseCase {
  constructor(
    private readonly characterQueryRepository: CharacterQueryRepository,
  ) {}

  async execute(dto: GetUnlockConfigDto): Promise<GetUnlockConfigResultDto> {
    const trackableEventTypes =
      await this.characterQueryRepository.getTrackableEventTypes(dto.userId);

    return {
      needsUnlockTracking: trackableEventTypes.length > 0,
      trackableEventTypes,
    };
  }
}
