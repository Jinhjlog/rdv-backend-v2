import { AggregateRoot, UniqueEntityId } from '@lib/domain';

export interface CharacterProps {
  id?: string;
  characterCode: string;
  name: string;
  description: string;
  unlockCondition?: Record<string, unknown>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Character extends AggregateRoot<CharacterProps> {
  constructor(props: CharacterProps) {
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

  get unlockCondition(): Record<string, unknown> | undefined {
    return this.props.unlockCondition;
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
}
