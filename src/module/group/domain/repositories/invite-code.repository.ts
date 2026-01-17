import { InviteCode } from '../models';

export abstract class InviteCodeRepository {
  abstract save(entity: InviteCode): Promise<void>;
  abstract findByCode(code: string): Promise<InviteCode | undefined>;
  abstract existsByCode(code: string): Promise<boolean>;
}
