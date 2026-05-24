/** 사용자 존재 확인 서비스 (LookupService) */
export abstract class UserLookupService {
  /** 해당 ID의 사용자가 존재하는지 확인합니다. */
  abstract existsById(userId: string): Promise<boolean>;
}
