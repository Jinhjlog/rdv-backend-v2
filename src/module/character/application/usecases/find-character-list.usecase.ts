import { Injectable } from '@nestjs/common';
import { CharacterQueryRepository } from '../../domain/repositories';
import { CharacterListItemQueryModel } from '../../domain/models';

@Injectable()
export class FindCharacterListUseCase {
  constructor(
    private readonly characterQueryRepository: CharacterQueryRepository,
  ) {}

  async execute(): Promise<CharacterListItemQueryModel[]> {
    const characters = await this.characterQueryRepository.findList();

    return characters;
  }
}
