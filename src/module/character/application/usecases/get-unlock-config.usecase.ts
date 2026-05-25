import { Injectable } from '@nestjs/common';
import { CharacterQueryService } from '../../domain/services';
import { GetUnlockConfigDto, GetUnlockConfigResultDto } from '../dtos';

@Injectable()
export class GetUnlockConfigUseCase {
  constructor(private readonly characterQueryService: CharacterQueryService) {}

  async execute(dto: GetUnlockConfigDto): Promise<GetUnlockConfigResultDto> {
    const trackableEventTypes =
      await this.characterQueryService.getTrackableEventTypes(dto.userId);

    return {
      needsUnlockTracking: trackableEventTypes.length > 0,
      trackableEventTypes,
    };
  }
}
