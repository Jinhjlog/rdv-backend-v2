import { AggregateRoot, UniqueEntityId } from '@lib/domain';
import {
  NotificationType,
  NotificationTypeCode,
  NotificationTypeValue,
} from '../notification/notification-type';

export interface NotificationSubscriptionProps {
  id?: string;
  userId: string;
  type: NotificationType;
  isSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationSubscription extends AggregateRoot<NotificationSubscriptionProps> {
  constructor(props: NotificationSubscriptionProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get typeValue(): NotificationTypeCode {
    return this.props.type.value;
  }

  get isSubscribed(): boolean {
    return this.props.isSubscribed;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** 구독 활성화 (멱등성 보장 - 이미 구독 중이면 무시) */
  subscribe(): void {
    if (this.props.isSubscribed) return;
    this.props.isSubscribed = true;
    this.props.updatedAt = new Date();
  }

  /** 구독 비활성화 (멱등성 보장 - 이미 비구독이면 무시) */
  unsubscribe(): void {
    if (!this.props.isSubscribed) return;
    this.props.isSubscribed = false;
    this.props.updatedAt = new Date();
  }

  /** 단일 타입 기본 구독 생성 팩토리 메서드 */
  static createDefault(
    userId: string,
    type: NotificationType,
  ): NotificationSubscription {
    const now = new Date();
    return new NotificationSubscription({
      userId,
      type,
      isSubscribed: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** 모든 알림 타입에 대해 기본 구독(활성) 목록 생성 */
  static createAll(userId: string): NotificationSubscription[] {
    return Object.values(NotificationTypeValue).map((typeCode) =>
      NotificationSubscription.createDefault(
        userId,
        NotificationType.unsafeCreate(typeCode),
      ),
    );
  }
}
