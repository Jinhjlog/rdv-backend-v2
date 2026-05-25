import { toKstDateString } from '@shared/utils';
import { NotificationListItemReadModel } from '../../domain/models';
import {
  NotificationListItemResponseDto,
  NotificationListResponseDto,
} from '../dtos/response';

export class NotificationTransformer {
  /**
   * 알림 목록 QueryModel -> Response DTO 변환
   */
  static toListResponse(
    items: NotificationListItemReadModel[],
    nextCursor: string | undefined,
    hasNext: boolean,
  ): NotificationListResponseDto {
    return {
      items: items.map((item) => this.toListItemResponse(item)),
      nextCursor: nextCursor ?? null,
      hasNext,
    };
  }

  private static toListItemResponse(
    item: NotificationListItemReadModel,
  ): NotificationListItemResponseDto {
    return {
      id: item.id,
      type: item.type.toLowerCase(),
      title: item.title,
      subtitle: item.subtitle,
      timeAgo: this.calculateTimeAgo(item.createdAt),
      isRead: item.isRead,
      referenceId: item.referenceId ?? null,
      referenceType: item.referenceType ?? null,
      createdAt: item.createdAt.toISOString(),
      readAt: item.readAt ? item.readAt.toISOString() : null,
    };
  }

  /**
   * 상대적 시간 계산
   *
   * - 1시간 미만: Nm (예: 5m, 30m)
   * - 24시간 미만: Nh (예: 1h, 12h)
   * - 7일 미만: Nd (예: 1d, 6d)
   * - 7일 이상: M/D (예: 2/11, 1/30)
   */
  private static calculateTimeAgo(createdAt: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '1m';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return toKstDateString(createdAt);
  }
}
