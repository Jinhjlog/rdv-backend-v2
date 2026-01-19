import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRegisteredEvent } from 'src/module/user/domain/events';
import { CharacterRepository } from '../../domain/repositories';
import { EntityNotFoundException } from '@shared/exception';
import { UnlockCharacterUseCase } from '../usecases';

@Injectable()
export class UserRegisteredEventHandler implements OnModuleInit {
  private readonly logger = new Logger(UserRegisteredEventHandler.name);

  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly unlockCharacterUseCase: UnlockCharacterUseCase,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: UserRegisteredEvent) => void this.handle(event),
      UserRegisteredEvent.name,
    );
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    const userId = event.userId.toString();
    const characterCode = event.metadata.characterCode;

    const characterId =
      await this.characterRepository.findIdByCode(characterCode);
    if (!characterId) {
      this.logger.error(
        `캐릭터 코드 ${characterCode}에 해당하는 캐릭터를 찾을 수 없습니다.`,
      );
      throw new EntityNotFoundException({
        entityName: 'Character',
        errorCode: 'CHARACTER_NOT_FOUND',
        id: characterCode,
      });
    }

    await this.unlockCharacterUseCase.execute({
      characterId,
      userId,
    });
  }
}
