import { Injectable } from '@nestjs/common';
import { NotificationSubscriptionQueryService } from '../../domain/services';
import { NotificationSubscriptionReadModel } from '../../domain/models';
import { GetNotificationSubscriptionsDto } from '../dtos/get-notification-subscriptions.dto';

/**
 * 알림 구독 설정 전체 조회 UseCase
 *
 * 사용자의 타입별 알림 수신 설정을 반환합니다.
 */
@Injectable()
export class GetNotificationSubscriptionsUseCase {
  constructor(
    private readonly notificationSubscriptionQueryService: NotificationSubscriptionQueryService,
  ) {}

  async execute(
    dto: GetNotificationSubscriptionsDto,
  ): Promise<NotificationSubscriptionReadModel[]> {
    return this.notificationSubscriptionQueryService.findByUserId(dto.userId);
  }
}
