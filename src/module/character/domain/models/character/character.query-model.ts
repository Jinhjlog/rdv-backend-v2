/**
 * 캐릭터 목록 조회용 쿼리 모델
 */
export interface CharacterListItemQueryModel {
  id: string;
  characterCode: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 보유 여부 포함 캐릭터 목록 조회용 쿼리 모델
 */
export interface CharacterListItemWithOwnershipQueryModel extends CharacterListItemQueryModel {
  isOwned: boolean;
}

/**
 * 캐릭터 상세 조회용 쿼리 모델
 */
export interface CharacterDetailQueryModel {
  id: string;
  characterCode: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
