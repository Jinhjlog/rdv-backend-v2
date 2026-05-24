/**
 * 캐릭터 목록 조회용 ReadModel
 */
export interface CharacterListReadModel {
  id: string;
  characterCode: string;
  name: string;
  description: string;
  isDefault: boolean;
  unlockHint?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 보유 여부 포함 캐릭터 목록 조회용 ReadModel
 */
export interface CharacterListWithOwnershipReadModel extends CharacterListReadModel {
  isOwned: boolean;
}

/**
 * 캐릭터 상세 조회용 ReadModel
 */
export interface CharacterDetailReadModel {
  id: string;
  characterCode: string;
  name: string;
  description: string;
  isDefault: boolean;
  unlockHint?: string;
  createdAt: Date;
  updatedAt: Date;
}
