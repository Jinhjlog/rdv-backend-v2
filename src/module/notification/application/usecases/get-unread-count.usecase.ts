import { Injectable } from '@nestjs/common';
import { NotificationQueryService } from '../../domain/services';

/**
 * 미읽음 알림 개수 조회 UseCase
 */
@Injectable()
export class GetUnreadCountUseCase {
  constructor(
    private readonly notificationQueryService: NotificationQueryService,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationQueryService.countUnread(userId);
  }
}
