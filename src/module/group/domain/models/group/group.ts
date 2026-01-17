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
   * 사용자가 그룹장인지 확인합니다.
   * @param userId
   * @returns 그룹장인 경우 true, 그렇지 않은 경우 false
   */
  isOwner(userId: string): boolean {
    return this.props.ownerId === userId;
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

  /**
   * 그룹 정보를 업데이트합니다.
   *
   * @param props 업데이트할 속성들 (선택적)
   */
  updateInfo(props: {
    name?: BoundedString;
    description?: BoundedString;
    iconCode?: string;
  }): void {
    if (props.name !== undefined) {
      this.props.name = props.name;
    }
    if (props.description !== undefined) {
      this.props.description = props.description;
    }
    if (props.iconCode !== undefined) {
      this.props.iconCode = props.iconCode;
    }
    this.props.updatedAt = new Date();
  }

  hasMember(userId: string): boolean {
    return this.props.members.some((member) => member.userId === userId);
  }

  /**
   * 해당 그룹의 멤버 수가 최대 인원 수에 도달했는지 확인합니다.
   *
   * @returns 최대 인원 수에 도달한 경우 true, 그렇지 않은 경우 false
   */
  isFull(): boolean {
    return this.props.members.length >= this.props.maxMembers;
  }

  /**
   * 그룹을 삭제할 수 있는지 확인합니다.
   * 모임장 혼자만 남아있어야 삭제 가능합니다.
   *
   * @returns 삭제 가능한 경우 true, 그렇지 않은 경우 false
   */
  canBeDeleted(): boolean {
    return this.props.members.length === 1;
  }

  /**
   * 멤버를 그룹에서 제거합니다.
   *
   * @param userId 제거할 멤버의 사용자 ID
   * @throws {DomainRuleViolationException} GROUP_MEMBER_NOT_FOUND - 멤버를 찾을 수 없는 경우
   * @throws {DomainRuleViolationException} GROUP_OWNER_CANNOT_BE_REMOVED - 모임장을 제거하려는 경우
   */
  removeMember(userId: string): void {
    // 모임장은 제거할 수 없음
    if (this.isOwner(userId)) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason: '모임장은 강퇴할 수 없습니다.',
        errorCode: 'GROUP_OWNER_CANNOT_BE_REMOVED',
      });
    }

    // 멤버 존재 여부 확인
    const memberIndex = this.props.members.findIndex(
      (member) => member.userId === userId,
    );
    if (memberIndex === -1) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason: '멤버를 찾을 수 없습니다.',
        errorCode: 'GROUP_MEMBER_NOT_FOUND',
      });
    }

    // 멤버 제거
    this.props.members.splice(memberIndex, 1);
    this.props.updatedAt = new Date();
  }

  /**
   * 회원이 모임에서 탈퇴합니다.
   *
   * @param userId 탈퇴하려는 회원의 사용자 ID
   * @throws {DomainRuleViolationException} GROUP_OWNER_CANNOT_LEAVE - 모임장이 탈퇴하려는 경우
   * @throws {DomainRuleViolationException} GROUP_MEMBER_NOT_FOUND - 멤버를 찾을 수 없는 경우
   */
  leaveGroup(userId: string): void {
    // 모임장은 탈퇴할 수 없음
    if (this.isOwner(userId)) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason: '모임장은 탈퇴할 수 없습니다.',
        errorCode: 'GROUP_OWNER_CANNOT_LEAVE',
      });
    }

    // 멤버 존재 여부 확인
    const memberIndex = this.props.members.findIndex(
      (member) => member.userId === userId,
    );

    if (memberIndex === -1) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason: '멤버를 찾을 수 없습니다.',
        errorCode: 'GROUP_MEMBER_NOT_FOUND',
      });
    }

    // 멤버 제거
    this.props.members.splice(memberIndex, 1);
    this.props.updatedAt = new Date();
  }
}
