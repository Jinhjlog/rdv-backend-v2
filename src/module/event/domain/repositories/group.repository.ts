export abstract class GroupRepository {
  abstract exists(groupId: string): Promise<boolean>;
}
