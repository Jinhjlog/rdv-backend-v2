import { AggregateRoot, UniqueEntityId } from '@lib/domain';
import { ShortTalkListener } from './short-talk-listener';
import { ShortTalkEventData } from './short-talk-event';

export interface ShortTalkSessionProps {
  id?: string;
  groupId: string;
  listeners: Map<string, ShortTalkListener>;
  createdAt: Date;
}

/**
 * Short Talk 세션 AggregateRoot
 *
 * 그룹별 SSE 연결을 관리합니다.
 * 리스너가 0명이면 세션을 정리해야 합니다.
 */
export class ShortTalkSession extends AggregateRoot<ShortTalkSessionProps> {
  constructor(props: ShortTalkSessionProps) {
    super(props, new UniqueEntityId(props.id));
  }

  get groupId(): string {
    return this.props.groupId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get listenerCount(): number {
    return this.props.listeners.size;
  }

  /**
   * 리스너 추가
   * 동일 사용자의 기존 연결이 있으면 먼저 종료 후 새 연결 등록
   */
  addListener(listener: ShortTalkListener): void {
    const existing = this.props.listeners.get(listener.userId);
    if (existing && !existing.isClosed()) {
      existing.disconnect();
    }
    this.props.listeners.set(listener.userId, listener);
  }

  /**
   * 리스너 제거
   */
  removeListener(userId: string): void {
    const listener = this.props.listeners.get(userId);
    if (listener) {
      listener.disconnect();
      this.props.listeners.delete(userId);
    }
  }

  /**
   * 리스너 조회
   */
  getListener(userId: string): ShortTalkListener | undefined {
    return this.props.listeners.get(userId);
  }

  /**
   * 모든 리스너 조회
   */
  getAllListeners(): ShortTalkListener[] {
    return Array.from(this.props.listeners.values());
  }

  /**
   * 모든 리스너에게 메시지 브로드캐스트
   */
  broadcastToAll(data: ShortTalkEventData): void {
    for (const listener of this.props.listeners.values()) {
      if (!listener.isClosed()) {
        listener.send(data);
      }
    }
  }

  /**
   * 모든 리스너 연결 종료
   */
  disconnectAll(): void {
    for (const listener of this.props.listeners.values()) {
      listener.disconnect();
    }
    this.props.listeners.clear();
  }

  /**
   * 세션 정리가 필요한지 확인 (리스너 0명)
   */
  shouldCleanup(): boolean {
    return this.props.listeners.size === 0;
  }

  /**
   * 닫힌 리스너 정리 (연결이 끊어진 리스너 제거)
   */
  cleanupClosedListeners(): void {
    for (const [userId, listener] of this.props.listeners.entries()) {
      if (listener.isClosed()) {
        this.props.listeners.delete(userId);
      }
    }
  }

  /**
   * 새 세션 생성 팩토리 메서드
   */
  static create(groupId: string): ShortTalkSession {
    return new ShortTalkSession({
      groupId,
      listeners: new Map(),
      createdAt: new Date(),
    });
  }
}
