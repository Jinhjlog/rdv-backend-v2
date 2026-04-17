import { Character } from '../models';

export abstract class CharacterRepository {
  abstract save(entity: Character): Promise<void>;
  abstract findById(id: string): Promise<Character | undefined>;
  abstract findIdByCode(code: string): Promise<string | undefined>;

  /**
   * 전체 캐릭터 목록을 조회합니다.
   *
   * @returns 전체 캐릭터 목록
   */
  abstract findAll(): Promise<Character[]>;

  /**
   * 특정 이벤트 타입의 언락 조건을 가진 캐릭터를 조회합니다.
   *
   * @param eventType 이벤트 타입 (예: "MENU_ACCESSED", "LEVEL_REACHED")
   * @returns 해당 이벤트 타입의 언락 조건을 가진 캐릭터 목록
   */
  abstract findByEventType(eventType: string): Promise<Character[]>;
}
