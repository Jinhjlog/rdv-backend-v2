import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  DomainRuleViolationException,
} from '@shared/exception';
import { NotificationRepository } from '../../domain/repositories';
import { Notification } from '../../domain/models';
import { ReadNotificationDto } from '../dtos';

/**
 * 개별 알림 읽음 처리 UseCase
 *
 * 1. 알림 조회
 * 2. 소유자 검증
 * 3. 읽음 처리 (멱등성 보장)
 * 4. 저장
 */
@Injectable()
export class ReadNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    dto: ReadNotificationDto,
  ): Promise<{ id: string; isRead: boolean; readAt?: Date }> {
    // 1. 알림 조회
    const notification = await this.notificationRepository.findById(
      dto.notificationId,
    );
    if (!notification) {
      throw new EntityNotFoundException({
        entityName: 'Notification',
        errorCode: 'NOTIFICATION_NOT_FOUND',
        id: dto.notificationId,
      });
    }

    // 2. 소유자 검증
    if (!notification.isOwnedBy(dto.userId)) {
      throw new DomainRuleViolationException({
        entityName: 'Notification',
        errorCode: 'NOTIFICATION_ACCESS_DENIED',
        reason: '접근 권한이 없습니다.',
      });
    }

    // 3. 읽음 처리 (이미 읽음이면 무시 — 멱등성)
    notification.markAsRead();

    // 4. 저장
    await this.notificationRepository.save(notification);

    return {
      id: notification.id.toString(),
      isRead: notification.isRead,
      readAt: notification.readAt,
    };
  }
}
