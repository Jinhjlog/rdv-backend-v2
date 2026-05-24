import { EventListReadModel, EventDetailReadModel } from '../../domain/models';
import {
  EventListResponseDto,
  EventDetailResponseDto,
  ActiveEventResponseDto,
} from '../dtos/response';
import { FindActiveEventResult } from '../../application/usecases/find-active-event.usecase';

export class EventTransformer {
  /**
   * Event 엔티티를 목록 Response DTO로 변환합니다
   */
  static toListResponse(events: EventListReadModel[]): EventListResponseDto {
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
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),
    };
  }

  /**
   * Event 상세 Query Model을 Response DTO로 변환합니다
   */
  static toDetailResponse(event: EventDetailReadModel): EventDetailResponseDto {
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
      isParticipantChecked: event.isParticipantChecked,
      maxParticipants: event.maxParticipants,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      participants: event.participants,
    };
  }

  /**
   * 진행중인 일정 조회 결과를 Response DTO로 변환합니다
   */
  static toActiveEventResponse(
    result: FindActiveEventResult,
  ): ActiveEventResponseDto {
    return {
      hasActiveEvent: result.hasActiveEvent,
      event: result.event ?? null,
    };
  }
}
