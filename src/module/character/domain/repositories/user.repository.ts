export abstract class UserRepository {
  abstract existsById(userId: string): Promise<boolean>;
}
