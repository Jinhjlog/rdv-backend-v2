import { Injectable } from '@nestjs/common';
import { ChangeCharacterDto } from '../dtos/change-character.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CharactersRepository } from '../../domain/repositories/characters.repository';
import {
  DomainRuleViolationException,
  EntityNotFoundException,
} from '@shared/exception';

@Injectable()
export class ChangeCharacterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly charactersRepository: CharactersRepository,
  ) {}

  async execute(dto: ChangeCharacterDto): Promise<void> {
    // 1. 사용자 조회
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException({
        entityName: 'User',
        id: dto.userId,
        errorCode: 'USER_NOT_FOUND',
      });
    }

    // 2. 보유 캐릭터인지 확인
    const isOwned = await this.charactersRepository.existsUserCharacter(
      dto.userId,
      dto.characterCode,
    );
    if (!isOwned) {
      throw new DomainRuleViolationException({
        entityName: 'UserCharacter',
        reason: '보유하지 않은 캐릭터는 변경할 수 없습니다',
        errorCode: 'CHARACTER_NOT_OWNED',
      });
    }

    // 3. 캐릭터 변경 (도메인 로직)
    user.changeCharacter(dto.characterCode);

    // 4. 영속화
    await this.userRepository.save(user);
  }
}
