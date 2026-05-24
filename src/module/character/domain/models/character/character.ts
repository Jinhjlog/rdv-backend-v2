import { AggregateRoot, UniqueEntityId } from '@lib/domain';

/**
 * 언락 조건 인터페이스
 *
 * characters.unlock_condition 필드에 저장되는 JSON 구조
 */
export interface UnlockCondition {
  eventType: string;
  [key: string]: unknown;
}

export interface CharacterProps {
  id?: string;
  characterCode: string;
  name: string;
  description: string;
  unlockCondition?: UnlockCondition;
  unlockHint?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Character extends AggregateRoot<CharacterProps> {
  private constructor(props: CharacterProps) {
    super(props, new UniqueEntityId(props.id));
  }

  // Getter 메서드
  get characterCode(): string {
    return this.props.characterCode;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get unlockCondition(): UnlockCondition | undefined {
    return this.props.unlockCondition;
  }

  get unlockHint(): string | undefined {
    return this.props.unlockHint;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** DB에서 복원합니다 (Mapper 전용, 검증 없음). */
  static unsafeCreate(props: CharacterProps): Character {
    return new Character(props);
  }
}
