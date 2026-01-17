import { AggregateRoot, BoundedString, UniqueEntityId } from '@lib/domain';
import { GroupMember } from './group-member';
import { DomainRuleViolationException } from '@shared/exception';

export interface GroupProps {
  id?: string;
  name: BoundedString;
  description: BoundedString;
  iconCode: string;
  ownerId: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;

  members: GroupMember[];
}

export class Group extends AggregateRoot<GroupProps> {
  constructor(props: GroupProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get name(): BoundedString {
    return this.props.name;
  }

  get description(): BoundedString {
    return this.props.description;
  }

  get iconCode(): string {
    return this.props.iconCode;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get maxMembers(): number {
    return this.props.maxMembers;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get members(): GroupMember[] {
    return this.props.members;
  }

  /**
   * 멤버를 그룹에 추가합니다.
   * @param member
   *
   * @throws {DomainRuleViolationException} GROUP_MEMBER_ALREADY_EXISTS - 이미 그룹의 구성원인 경우
   */
  addMember(member: GroupMember): void {
    const exists = this.hasMember(member.userId);
    if (exists) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason: '이 멤버는 이미 그룹의 구성원입니다.',
        errorCode: 'GROUP_MEMBER_ALREADY_EXISTS',
      });
    }

    this.props.members.push(member);
  }

  hasMember(userId: string): boolean {
    return this.props.members.some((member) => member.userId === userId);
  }
}
