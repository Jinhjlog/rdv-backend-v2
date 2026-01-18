import {
  EventListItemQueryModel,
  EventDetailQueryModel,
} from '../../domain/models';
import { EventListResponseDto, EventDetailResponseDto } from '../dtos/response';

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

  /**
   * Event 상세 Query Model을 Response DTO로 변환합니다
   */
  static toDetailResponse(
    event: EventDetailQueryModel,
  ): EventDetailResponseDto {
    return {
      id: event.id,
      groupId: event.groupId,
      createdBy: event.createdBy,
      title: event.title,
      description: event.description,
      eventTime: event.eventTime,
      trackingStartTime: event.trackingStartTime,
      endTime: event.endTime,
      locationAddress: event.locationAddress,
      locationDetail: event.locationDetail,
      locationLatitude: event.locationLatitude,
      locationLongitude: event.locationLongitude,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      participants: event.participants,
    };
  }
}
