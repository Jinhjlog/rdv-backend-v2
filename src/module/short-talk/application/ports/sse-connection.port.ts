import { Observable } from 'rxjs';
import {
  ShortTalkEvent,
  ShortTalkSenderInfo,
} from '../../domain/models/short-talk/short-talk-event';

/**
 * SSE 메시지 이벤트 형식
 *
 * Port의 subscribe() 반환 타입으로 사용됩니다.
 * Adapter에서 이 형식으로 변환하여 클라이언트에 전달합니다.
 */
export interface SseMessageEvent {
  data: ShortTalkEvent;
  id?: string;
  type?: string;
  retry?: number;
}

/**
 * SSE 연결 관리 Port
 *
 * 실시간 SSE 연결의 생성/발행/해제를 추상화합니다.
 *
 * - Production: SseConnectionAdapter (인메모리 Map + RxJS Subject)
 * - 확장: Redis Pub/Sub 기반 어댑터로 교체 가능
 */
export abstract class SseConnectionPort {
  /** SSE 연결을 생성하고 이벤트 스트림을 반환합니다. */
  abstract subscribe(
    groupId: string,
    userId: string,
    senderInfo: ShortTalkSenderInfo,
  ): Observable<SseMessageEvent>;

  /** 그룹의 모든 연결에 이벤트를 브로드캐스트합니다. */
  abstract publish(groupId: string, event: ShortTalkEvent): void;

  /** SSE 연결을 해제합니다. */
  abstract disconnect(groupId: string, userId: string): void;

  /** 특정 연결의 발신자 정보를 조회합니다. */
  abstract getSenderInfo(
    groupId: string,
    userId: string,
  ): ShortTalkSenderInfo | undefined;
}
