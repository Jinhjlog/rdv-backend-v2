import { EntityClass, UniqueEntityId } from '@lib/domain';
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

export class InviteCode extends EntityClass<InviteCodeProps> {
  constructor(props: InviteCodeProps) {
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
