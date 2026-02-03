import {
  CharacterListItemQueryModel,
  CharacterListItemWithOwnershipQueryModel,
  CharacterDetailQueryModel,
} from '../models';

export interface FindCharacterDetailParams {
  id: string;
}

/**
 * Character 조회용 Repository
 *
 * 복잡한 조회 쿼리를 처리합니다.
 */
export abstract class CharacterQueryRepository {
  /**
   * 목록을 조회합니다.
   *
   * @returns 목록
   */
  abstract findList(): Promise<CharacterListItemQueryModel[]>;

  /**
   * 보유 여부 포함 목록을 조회합니다.
   *
   * @param userId 사용자 ID
   * @returns 보유 여부 포함 목록
   */
  abstract findListWithOwnership(
    userId: string,
  ): Promise<CharacterListItemWithOwnershipQueryModel[]>;

  /**
   * ID로 상세 정보를 조회합니다.
   *
   * @param id 엔티티 ID
   * @returns 상세 정보 또는 null
   */
  abstract findDetail(
    params: FindCharacterDetailParams,
  ): Promise<CharacterDetailQueryModel | undefined>;

  /**
   * 사용자가 트래킹해야 할 이벤트 타입 목록을 조회합니다.
   *
   * 언락 조건이 있고 아직 보유하지 않은 캐릭터들의 eventType을 반환합니다.
   *
   * @param userId 사용자 ID
   * @returns 중복 제거된 트래킹 가능한 이벤트 타입 목록
   */
  abstract getTrackableEventTypes(userId: string): Promise<string[]>;
}
