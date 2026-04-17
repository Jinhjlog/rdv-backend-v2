import { DomainEvents } from '@lib/domain/events/domain-events';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRegisteredEvent } from 'src/module/user/domain/events';
import { CharacterRepository } from '../../domain/repositories';
import { DomainRuleViolationException } from '@shared/exception';
import { UnlockCharacterUseCase } from '../usecases';

/**
 * 사용자 회원가입 시 모든 캐릭터를 자동 지급한다.
 *
 * 초기 온보딩 편의를 위해 조건부 언락(CHAT_COUNT 등) 캐릭터 포함 전체를
 * 즉시 보유 상태로 만든다. 언락 힌트·조건은 UI 표시용으로만 남는다.
 */
@Injectable()
export class UserRegisteredEventHandler implements OnModuleInit {
  private readonly logger = new Logger(UserRegisteredEventHandler.name);

  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly unlockCharacterUseCase: UnlockCharacterUseCase,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event) => void this.handle(event as UserRegisteredEvent),
      UserRegisteredEvent.name,
    );
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    const userId = event.userId.toString();

    const characters = await this.characterRepository.findAll();

    if (characters.length === 0) {
      this.logger.warn(
        `지급 가능한 캐릭터가 없습니다. 시드 데이터 확인 필요. userId=${userId}`,
      );
      return;
    }

    for (const character of characters) {
      const characterId = character.id.toString();
      try {
        await this.unlockCharacterUseCase.execute({
          characterId,
          userId,
        });
      } catch (error) {
        if (this.isAlreadyUnlocked(error)) {
          this.logger.debug(
            `이미 보유 중인 캐릭터 건너뜀: userId=${userId}, characterId=${characterId}`,
          );
          continue;
        }
        throw error;
      }
    }

    this.logger.log(
      `회원가입 기본 캐릭터 지급 완료: userId=${userId}, 총 ${characters.length}개`,
    );
  }

  private isAlreadyUnlocked(error: unknown): boolean {
    return (
      error instanceof DomainRuleViolationException &&
      error.errorCode === 'CHARACTER_ALREADY_UNLOCKED'
    );
  }
}
