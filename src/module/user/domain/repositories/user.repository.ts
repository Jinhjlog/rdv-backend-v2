import { User } from '../models';

export abstract class UserRepository {
  abstract save(entity: User): Promise<void>;
  abstract findById(id: string): Promise<User | undefined>;
  abstract findByDeviceId(deviceId: string): Promise<User | undefined>;
}
