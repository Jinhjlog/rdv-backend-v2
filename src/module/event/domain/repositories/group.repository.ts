export abstract class GroupRepository {
  abstract exists(groupId: string): Promise<boolean>;
  abstract findMemberUserIds(groupId: string): Promise<string[]>;
}
