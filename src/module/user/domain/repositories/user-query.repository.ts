import { UserQueryModel } from '../models';

export abstract class UserQueryRepository {
  abstract findById(userId: string): Promise<UserQueryModel | undefined>;
}
