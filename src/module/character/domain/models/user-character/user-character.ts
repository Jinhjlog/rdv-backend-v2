import { AggregateRoot, UniqueEntityId } from '@lib/domain';
import { CharacterUnlockedEvent } from '../../events';

export interface UserCharacterProps {
  id?: string;
  userId: string;
  characterId: string;
  unlockedAt: Date;
}

/**
 * UserCharacter Aggregate Root
 *
 * 사용자가 소유한 캐릭터를 나타내는 집합체입니다.
 * 유저와 캐릭터 간의 관계를 관리하며, 캐릭터 언록 상태를 추적합니다.
 */
export class UserCharacter extends AggregateRoot<UserCharacterProps> {
  private constructor(props: UserCharacterProps) {
    super(props, new UniqueEntityId(props.id));
  }

  /**
   * 새로운 UserCharacter를 생성합니다.
   * 생성 시 CharacterUnlockedEvent를 발행합니다.
   */
  static create(
    props: Pick<UserCharacterProps, 'userId' | 'characterId'>,
  ): UserCharacter {
    const userCharacter = new UserCharacter({
      ...props,
      unlockedAt: new Date(),
    });

    return userCharacter;
  }

  unlock(name: string, code: string): void {
    this.addDomainEvent(
      new CharacterUnlockedEvent(this.id, {
        userId: this.userId,
        characterCode: code,
        name: name,
        characterId: this.characterId,
      }),
    );
  }

  // Getter 메서드
  get userId(): string {
    return this.props.userId;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get unlockedAt(): Date {
    return this.props.unlockedAt;
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: UserCharacterProps): UserCharacter {
    return new UserCharacter(props);
  }
}
