import { EventListItemQueryModel } from '../../domain/models';
import { EventListResponseDto } from '../dtos/response';

export class EventTransformer {
  /**
   * Event 엔티티를 목록 Response DTO로 변환합니다
   */
  static toListResponse(
    events: EventListItemQueryModel[],
  ): EventListResponseDto {
    return {
      items: events.map((event) => ({
        id: event.id,
        title: event.title,
        eventTime: event.eventTime,
        locationAddress: event.locationAddress,
        locationDetail: event.locationDetail,
        status: event.status,
        participants: event.participants,
        maxParticipants: event.maxParticipants,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),
    };
  }
}
