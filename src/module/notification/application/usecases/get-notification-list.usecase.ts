import { Injectable } from '@nestjs/common';
import { CursorUtil } from '@shared/utils';
import { NotificationQueryRepository } from '../../domain/repositories';
import { NotificationListItemQueryModel } from '../../domain/models';
import { NotificationType } from '../../domain/models';
import { GetNotificationListDto } from '../dtos';

/**
 * 알림 목록 조회 UseCase
 *
 * 1. 커서 디코딩
 * 2. limit + 1로 조회하여 다음 페이지 존재 여부 확인
 * 3. 다음 커서 생성
 */
@Injectable()
export class GetNotificationListUseCase {
  constructor(
    private readonly notificationQueryRepository: NotificationQueryRepository,
  ) {}

  async execute(dto: GetNotificationListDto): Promise<{
    items: NotificationListItemQueryModel[];
    nextCursor?: string;
    hasNext: boolean;
  }> {
    // 1. 커서 디코딩
    const decodedCursor = dto.cursor
      ? CursorUtil.decode(dto.cursor)
      : undefined;

    // 2. 타입 변환 (유효하지 않은 값이면 ValueObjectValidationException 발생)
    const type = dto.type ? NotificationType.create(dto.type) : undefined;

    // 3. limit + 1로 조회하여 다음 페이지 존재 여부 확인
    const notifications = await this.notificationQueryRepository.findList({
      userId: dto.userId,
      type,
      cursor: decodedCursor,
      limit: dto.limit + 1,
    });

    // 3. 다음 페이지 존재 여부 판단
    const hasNext = notifications.length > dto.limit;
    const items = hasNext ? notifications.slice(0, dto.limit) : notifications;

    // 4. 다음 커서 생성
    const nextCursor =
      hasNext && items.length > 0
        ? CursorUtil.encode({
            id: items[items.length - 1].id,
            createdAt: items[items.length - 1].createdAt,
          })
        : undefined;

    return { items, nextCursor, hasNext };
  }
}
