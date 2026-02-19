import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../domain/repositories';
import { NotificationType } from '../../domain/models';
import { ReadAllNotificationsDto } from '../dtos';

/**
 * 전체 알림 읽음 처리 UseCase
 *
 * 1. 해당 유저의 미읽음 알림 일괄 읽음 처리
 * 2. 타입 필터 적용 (선택)
 */
@Injectable()
export class ReadAllNotificationsUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    dto: ReadAllNotificationsDto,
  ): Promise<{ updatedCount: number }> {
    // 타입 변환 (유효하지 않은 값이면 ValueObjectValidationException 발생)
    const type = dto.type ? NotificationType.create(dto.type) : undefined;

    const updatedCount =
      await this.notificationRepository.markAllAsReadByUserId(dto.userId, type);
    return { updatedCount };
  }
}
