import { Injectable } from '@nestjs/common';
import { NotificationSubscriptionRepository } from '../../domain/repositories';
import { NotificationType } from '../../domain/models';
import { NotificationSubscription } from '../../domain/models/notification-subscription/notification-subscription';
import { UpdateNotificationSubscriptionDto } from '../dtos/update-notification-subscription.dto';

/**
 * 알림 구독 설정 변경 UseCase
 *
 * 사용자의 특정 타입 알림 구독 상태를 변경합니다.
 * 구독 데이터가 없으면 기본값(구독)으로 신규 생성 후 변경합니다.
 */
@Injectable()
export class UpdateNotificationSubscriptionUseCase {
  constructor(
    private readonly notificationSubscriptionRepository: NotificationSubscriptionRepository,
  ) {}

  async execute(
    dto: UpdateNotificationSubscriptionDto,
  ): Promise<NotificationSubscription> {
    // 1. 해당 타입의 구독 설정 조회
    let subscription =
      await this.notificationSubscriptionRepository.findByUserIdAndType(
        dto.userId,
        dto.type,
      );

    // 2. 없으면 기본 구독 상태로 신규 생성
    if (!subscription) {
      subscription = NotificationSubscription.createDefault(
        dto.userId,
        NotificationType.create(dto.type),
      );
    }

    // 3. 구독 상태 변경
    if (dto.isSubscribed) {
      subscription.subscribe();
    } else {
      subscription.unsubscribe();
    }

    // 4. 저장
    await this.notificationSubscriptionRepository.save(subscription);

    return subscription;
  }
}
