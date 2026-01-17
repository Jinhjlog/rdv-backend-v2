import { Group } from '../models';

export abstract class GroupRepository {
  abstract save(entity: Group): Promise<void>;
  abstract findById(id: string): Promise<Group | undefined>;
  abstract existsByOwnerId(ownerId: string): Promise<boolean>;
}
