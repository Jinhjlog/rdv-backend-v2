import { EntityClass, UniqueEntityId } from '@lib/domain';
import { Subject } from 'rxjs';
import { ShortTalkEventData } from './short-talk-event';

export interface ShortTalkListenerProps {
  id?: string;
  userId: string;
  subject: Subject<ShortTalkEventData>;
  connectedAt: Date;
}

/**
 * Short Talk 리스너 엔티티
 *
 * SSE 연결된 개별 사용자를 나타내며,
 * Subject를 통해 실시간 메시지를 전송합니다.
 */
export class ShortTalkListener extends EntityClass<ShortTalkListenerProps> {
  constructor(props: ShortTalkListenerProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get userId(): string {
    return this.props.userId;
  }

  get subject(): Subject<ShortTalkEventData> {
    return this.props.subject;
  }

  get connectedAt(): Date {
    return this.props.connectedAt;
  }

  /**
   * 리스너에게 메시지 전송
   */
  send(data: ShortTalkEventData): void {
    this.props.subject.next(data);
  }

  /**
   * 연결 종료 (Subject 완료)
   */
  disconnect(): void {
    this.props.subject.complete();
  }

  /**
   * 연결 여부 확인
   */
  isClosed(): boolean {
    return this.props.subject.closed;
  }
}
