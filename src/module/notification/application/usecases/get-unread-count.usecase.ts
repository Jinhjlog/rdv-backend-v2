import { Injectable } from '@nestjs/common';
import { NotificationQueryRepository } from '../../domain/repositories';

/**
 * 미읽음 알림 개수 조회 UseCase
 */
@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    private readonly notificationQueryRepository: NotificationQueryRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationQueryRepository.countUnread(userId);
  }
}
