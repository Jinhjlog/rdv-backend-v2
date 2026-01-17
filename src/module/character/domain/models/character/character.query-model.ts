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
