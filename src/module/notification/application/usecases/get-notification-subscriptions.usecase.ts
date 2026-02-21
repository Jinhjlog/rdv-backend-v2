import { Injectable } from '@nestjs/common';
import { NotificationSubscriptionQueryRepository } from '../../domain/repositories';
import { NotificationSubscriptionQueryModel } from '../../domain/models';
import { GetNotificationSubscriptionsDto } from '../dtos/get-notification-subscriptions.dto';

/**
 * 알림 구독 설정 전체 조회 UseCase
 *
 * 사용자의 타입별 알림 수신 설정을 반환합니다.
 */
@Injectable()
export class GetNotificationSubscriptionsUseCase {
  constructor(
    private readonly notificationSubscriptionQueryRepository: NotificationSubscriptionQueryRepository,
  ) {}

  async execute(
    dto: GetNotificationSubscriptionsDto,
  ): Promise<NotificationSubscriptionQueryModel[]> {
    return this.notificationSubscriptionQueryRepository.findByUserId(
      dto.userId,
    );
  }
}
