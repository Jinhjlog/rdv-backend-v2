/** 사용자 프로필 조회용 ReadModel */
export interface UserReadModel {
  id: string;
  nickname: string;
  nameTag: string;
  preferredThemeColor: string;
  characterCode: string;
  level: number;
  experience: number;
}
