import { EntityClass, UniqueEntityId } from '@lib/domain';

/**
 * 모임원 역할 Enum
 */
export enum GroupMemberRole {
  /**
   * 모임장
   */
  OWNER = 'OWNER',

  /**
   * 일반 참여자
   */
  MEMBER = 'MEMBER',
}

export interface GroupMemberProps {
  id?: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  invitedBy?: string;
  joinedAt: Date;
}

export class GroupMember extends EntityClass<GroupMemberProps> {
  constructor(props: GroupMemberProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): GroupMemberRole {
    return this.props.role;
  }

  get invitedBy(): string | undefined {
    return this.props.invitedBy;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  promoteToOwner(): void {
    this.props.role = GroupMemberRole.OWNER;
  }

  demoteToMember(): void {
    this.props.role = GroupMemberRole.MEMBER;
  }

  /**
   * GroupMember 생성 팩토리 메서드
   */
  static create(
    props: Pick<GroupMemberProps, 'groupId' | 'userId' | 'role' | 'invitedBy'>,
  ): GroupMember {
    return new GroupMember({
      ...props,
      joinedAt: new Date(),
    });
  }

  static unsafeCreate(props: GroupMemberProps): GroupMember {
    return new GroupMember(props);
  }
}
