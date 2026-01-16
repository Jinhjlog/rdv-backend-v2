import { UserInfo } from '../interfaces';

export abstract class UserRepository {
  abstract findById(id: string): Promise<UserInfo | null>;
}
