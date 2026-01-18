export abstract class UserRepository {
  abstract findById(userId: string): Promise<
    | {
        nickname: string;
        nameTag: string;
        characterCode: string;
      }
    | undefined
  >;
}
