import { AggregateRoot, UniqueEntityId } from '@lib/domain';
import { NotificationType } from './notification-type';

export interface NotificationProps {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  readAt?: Date;
  createdAt: Date;
}

export class Notification extends AggregateRoot<NotificationProps> {
  constructor(props: NotificationProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get subtitle(): string {
    return this.props.subtitle;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get referenceId(): string | undefined {
    return this.props.referenceId;
  }

  get referenceType(): string | undefined {
    return this.props.referenceType;
  }

  get readAt(): Date | undefined {
    return this.props.readAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** 알림 소유자인지 확인 */
  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  /** 읽음 처리 (멱등성 보장 - 이미 읽음이면 무시) */
  markAsRead(): void {
    if (this.props.isRead) return;
    this.props.isRead = true;
    this.props.readAt = new Date();
  }

  /** 알림 생성 팩토리 메서드 */
  static create(
    props: Omit<NotificationProps, 'id' | 'isRead' | 'readAt' | 'createdAt'>,
  ): Notification {
    return new Notification({
      ...props,
      isRead: false,
      createdAt: new Date(),
    });
  }
}
