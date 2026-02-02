import { Injectable } from '@nestjs/common';
import { CharacterQueryRepository } from '../../domain/repositories';
import { CharacterListItemWithOwnershipQueryModel } from '../../domain/models';

export interface FindCharacterListInput {
  userId: string;
}

@Injectable()
export class FindCharacterListUseCase {
  constructor(
    private readonly characterQueryRepository: CharacterQueryRepository,
  ) {}

  async execute(
    input: FindCharacterListInput,
  ): Promise<CharacterListItemWithOwnershipQueryModel[]> {
    const characters =
      await this.characterQueryRepository.findListWithOwnership(input.userId);

    return characters;
  }
}
