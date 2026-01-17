import {
  AggregateRoot,
  BoundedString,
  PositiveNumber,
  UniqueEntityId,
} from '@lib/domain';
import { NameTag } from './name-tag';

export interface UserProps {
  id?: string;
  deviceId: string;
  nickname: BoundedString;
  nameTag: NameTag;
  preferredThemeColor: string;
  characterCode: string;
  level: PositiveNumber;
  experience: PositiveNumber;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserProps> {
  constructor(props: UserProps) {
    super(props, new UniqueEntityId(props.id));
  }

  // Getter 메서드
  get deviceId(): string {
    return this.props.deviceId;
  }

  get nickname(): BoundedString {
    return this.props.nickname;
  }

  get nameTag(): NameTag {
    return this.props.nameTag;
  }

  get preferredThemeColor(): string {
    return this.props.preferredThemeColor;
  }

  get characterCode(): string {
    return this.props.characterCode;
  }

  get level(): PositiveNumber {
    return this.props.level;
  }

  get experience(): PositiveNumber {
    return this.props.experience;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * 캐릭터 변경
   * @param characterCode 새로운 캐릭터 코드
   */
  changeCharacter(characterCode: string): void {
    this.props.characterCode = characterCode;
    this.props.updatedAt = new Date();
  }

  /**
   * 테마 색상 변경
   * @param color 새로운 테마 색상 (hex)
   */
  changeThemeColor(color: string): void {
    this.props.preferredThemeColor = color;
    this.props.updatedAt = new Date();
  }
}
