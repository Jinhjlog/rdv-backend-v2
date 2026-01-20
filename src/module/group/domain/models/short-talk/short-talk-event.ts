/**
 * SSE 이벤트 데이터 타입
 *
 * Short Talk에서 전송되는 모든 이벤트의 공통 타입입니다.
 * NestJS SSE는 { data } 형식을 사용하므로 data 필드 안에 포함됩니다.
 */
export interface ShortTalkEventData {
  type: 'connected' | 'message' | 'ping' | 'error';
  timestamp?: string;
  groupId?: string;
  content?: string;
  senderId?: string;
  message?: string; // 에러 메시지용
  sender?: {
    id: string;
    nickname: string;
    nameTag: string;
    characterCode: string;
    preferred_theme_color: string;
  };
  [key: string]: unknown;
}

/**
 * NestJS SSE MessageEvent 형식
 * @see https://docs.nestjs.com/techniques/server-sent-events
 *
 * - id: 메시지 ID (Last-Event-Id로 재연결 시 사용)
 * - type: 이벤트 타입 (클라이언트에서 addEventListener로 구분)
 * - data: 이벤트 데이터
 * - retry: 재연결 간격 (ms)
 */
export interface SseMessageEvent {
  data: ShortTalkEventData;
  id?: string;
  type?: string;
  retry?: number;
}

/**
 * ShortTalkEventData를 SSE 형식으로 변환하는 헬퍼 함수
 * @param data - 이벤트 데이터
 * @param id - 메시지 ID (선택, Last-Event-Id용)
 */
export function toSseEvent(
  data: ShortTalkEventData,
  id?: string,
): SseMessageEvent {
  const event: SseMessageEvent = { data };
  if (id) {
    event.id = id;
  }
  return event;
}
