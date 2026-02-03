/**
 * 언락 이벤트 트래킹 요청 DTO
 */
export class TrackUnlockEventDto {
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

/**
 * 언락된 캐릭터 정보
 */
export class UnlockedCharacterInfo {
  characterCode: string;
  name: string;
  description: string;
}

/**
 * 언락 이벤트 트래킹 결과 DTO
 */
export class TrackUnlockEventResultDto {
  unlockedCharacters: UnlockedCharacterInfo[];
}
