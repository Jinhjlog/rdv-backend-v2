import { AggregateRoot, UniqueEntityId } from '@lib/domain';
import { InviteAccessCode } from './invite-access-code';

export interface InviteCodeProps {
  id?: string;
  groupId: string;
  code: InviteAccessCode;
  createdBy: string;
  expiresAt: Date;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
  createdAt: Date;
}

export class InviteCode extends AggregateRoot<InviteCodeProps> {
  private constructor(props: InviteCodeProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get code(): InviteAccessCode {
    return this.props.code;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isUsed(): boolean {
    return this.props.isUsed;
  }

  get usedBy(): string | undefined {
    return this.props.usedBy;
  }

  get usedAt(): Date | undefined {
    return this.props.usedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * 초대 코드를 사용 처리합니다.
   *
   * @param userId 사용자 ID
   */
  markAsUsed(userId: string): void {
    this.props.isUsed = true;
    this.props.usedBy = userId;
    this.props.usedAt = new Date();
  }

  /**
   * 초대 코드가 만료되었는지 확인합니다.
   *
   * @returns 만료된 경우 true, 그렇지 않은 경우 false
   */
  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  /**
   * 초대 코드가 사용 가능한지 확인합니다.
   * 미사용 + 미만료 상태여야 합니다.
   *
   * @returns 사용 가능한 경우 true, 그렇지 않은 경우 false
   */
  isValid(): boolean {
    return !this.props.isUsed && !this.isExpired();
  }

  static create(
    props: Pick<InviteCodeProps, 'groupId' | 'code' | 'createdBy'>,
  ): InviteCode {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMinutes(expiresAt.getMinutes() + 2); // 현재 시간에서 2분 후로 설정

    return new InviteCode({
      ...props,
      expiresAt,
      isUsed: false,
      createdAt: now,
    });
  }

  static unsafeCreate(props: InviteCodeProps): InviteCode {
    return new InviteCode(props);
  }
}
