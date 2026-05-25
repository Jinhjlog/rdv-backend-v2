import { Injectable } from '@nestjs/common';
import { CharacterQueryService } from '../../domain/services';
import { CharacterListWithOwnershipReadModel } from '../../domain/models';

export interface FindCharacterListInput {
  userId: string;
}

@Injectable()
export class FindCharacterListUseCase {
  constructor(private readonly characterQueryService: CharacterQueryService) {}

  async execute(
    input: FindCharacterListInput,
  ): Promise<CharacterListWithOwnershipReadModel[]> {
    return this.characterQueryService.findListWithOwnership(input.userId);
  }
}
