import { AggregateRoot, UniqueEntityId } from '@lib/domain';

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
  constructor(props: UserCharacterProps) {
    super(props, new UniqueEntityId(props.id));
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
}
