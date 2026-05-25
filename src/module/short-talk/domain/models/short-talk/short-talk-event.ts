/**
 * Short Talk 발신자 정보
 */
export interface ShortTalkSenderInfo {
  id: string;
  nickname: string;
  nameTag: string;
  characterCode: string;
  preferredThemeColor: string;
}

/**
 * SSE 이벤트 Discriminated Union
 *
 * 이벤트 타입별로 필수 필드가 다르며, 타입 분기 시 컴파일 타임에 검증됩니다.
 */
export type ShortTalkEvent =
  | ShortTalkConnectedEvent
  | ShortTalkMessageEvent
  | ShortTalkPingEvent
  | ShortTalkErrorEvent;

export interface ShortTalkConnectedEvent {
  type: 'connected';
  groupId: string;
  timestamp: string;
}

export interface ShortTalkMessageEvent {
  type: 'message';
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
  timestamp: string;
  sender: ShortTalkSenderInfo;
}

export interface ShortTalkPingEvent {
  type: 'ping';
  timestamp: string;
}

export interface ShortTalkErrorEvent {
  type: 'error';
  message: string;
  timestamp: string;
}
