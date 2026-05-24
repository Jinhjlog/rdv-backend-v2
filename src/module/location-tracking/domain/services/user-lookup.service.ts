/** 사용자 정보 조회 서비스 (LookupService) */
export abstract class UserLookupService {
  /** 사용자 정보를 조회합니다. */
  abstract findById(userId: string): Promise<
    | {
        nickname: string;
        nameTag: string;
        characterCode: string;
      }
    | undefined
  >;
}
