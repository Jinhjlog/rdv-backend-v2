import {
  CharacterListReadModel,
  CharacterListWithOwnershipReadModel,
  CharacterDetailReadModel,
} from '../models';

export interface FindCharacterDetailParams {
  id: string;
}

/** 캐릭터 조회용 QueryService */
export abstract class CharacterQueryService {
  /** 캐릭터 목록을 조회합니다. */
  abstract findList(): Promise<CharacterListReadModel[]>;

  /** 보유 여부 포함 캐릭터 목록을 조회합니다. */
  abstract findListWithOwnership(
    userId: string,
  ): Promise<CharacterListWithOwnershipReadModel[]>;

  /** ID로 캐릭터 상세를 조회합니다. */
  abstract findDetail(
    params: FindCharacterDetailParams,
  ): Promise<CharacterDetailReadModel | undefined>;

  /** 사용자가 트래킹해야 할 이벤트 타입 목록을 조회합니다. */
  abstract getTrackableEventTypes(userId: string): Promise<string[]>;
}
