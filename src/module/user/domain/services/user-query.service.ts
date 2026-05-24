import { UserReadModel } from '../models';

/** 사용자 프로필 조회용 QueryService */
export abstract class UserQueryService {
  /** ID로 사용자 프로필을 조회합니다. */
  abstract findById(userId: string): Promise<UserReadModel | undefined>;
}
