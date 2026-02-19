import { AggregateRoot, UniqueEntityId } from '@lib/domain';
import { SystemNotificationBroadcastedEvent } from '../../events';

export interface SystemNotificationProps {
  title: string;
  subtitle: string;
  sendPush: boolean;
}

/**
 * SystemNotification 트랜지언트 애그리게잇
 *
 * DB에 저장되지 않으며 도메인 이벤트 발행만을 위해 존재합니다.
 * 관리자가 전체 유저 대상 시스템 공지를 전송할 때 생성되며,
 * SystemNotificationBroadcastedEvent를 발행하여 device-token 모듈의
 * 푸시 핸들러가 FCM 전송을 처리하도록 합니다.
 */
export class SystemNotification extends AggregateRoot<SystemNotificationProps> {
  private constructor(props: SystemNotificationProps, id: UniqueEntityId) {
    super(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get subtitle(): string {
    return this.props.subtitle;
  }

  get sendPush(): boolean {
    return this.props.sendPush;
  }

  /**
   * 브로드캐스트 팩토리 메서드
   *
   * 인스턴스 생성과 동시에 SystemNotificationBroadcastedEvent를 발행합니다.
   * UseCase에서 생성 후 DomainEvents.dispatchEventsForAggregate()를 호출해야 합니다.
   */
  static broadcast(props: SystemNotificationProps): SystemNotification {
    const id = new UniqueEntityId();
    const aggregate = new SystemNotification(props, id);

    aggregate.addDomainEvent(
      new SystemNotificationBroadcastedEvent(id, {
        title: props.title,
        subtitle: props.subtitle,
        sendPush: props.sendPush,
      }),
    );

    return aggregate;
  }
}
