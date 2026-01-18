import { Prisma, events as EventPrisma } from '@prisma/generated/client';
import {
  Event,
  EventParticipant,
  EventResult,
  EventSchedule,
  EventStatus,
  Location,
} from '../../domain/models';
import { BoundedString } from '@lib/domain';

/**
 * EventMapper
 *
 * 영속성 계층의 Event을 도메인 Aggregate Root로 변환
 * Prisma 모델 ↔ 도메인 모델 매핑 담당
 */
export class EventMapper {
  /**
   * Prisma 모델을 도메인 Aggregate Root로 변환합니다
   *
   * @param {EventPrisma} prismaEvent Prisma 모델
   * @returns {Event} 도메인 Aggregate Root
   */
  static toDomain(
    prismaEvent: EventPrisma,
    eventParticipants: EventParticipant[],
    eventResults?: EventResult,
  ): Event {
    return new Event({
      id: prismaEvent.id,
      groupId: prismaEvent.group_id,
      createdBy: prismaEvent.created_by,
      title: BoundedString.unsafeCreate(prismaEvent.title),
      description: BoundedString.unsafeCreate(prismaEvent.description),
      schedule: EventSchedule.unsafeCreate({
        eventTime: prismaEvent.event_time,
        trackingStartTime: prismaEvent.tracking_start_time,
        endTime: prismaEvent.end_time,
      }),
      location: Location.unsafeCreate({
        address: prismaEvent.location_address,
        detail: BoundedString.unsafeCreate(prismaEvent.location_detail),
        latitude: prismaEvent.location_latitude.toString(),
        longitude: prismaEvent.location_longitude.toString(),
      }),
      status: EventStatus[prismaEvent.status],
      createdAt: prismaEvent.created_at,
      updatedAt: prismaEvent.updated_at,
      participants: eventParticipants,
      result: eventResults,
    });
  }

  /**
   * 도메인 Aggregate Root를 Prisma 모델로 변환합니다
   *
   * @param {Event} domainEvent 도메인 Aggregate Root
   * @returns {Prisma.eventsCreateInput} Prisma 모델 (insert/update용)
   */
  static toPersistence(domainEvent: Event): Prisma.eventsCreateInput {
    return {
      groups: { connect: { id: domainEvent.groupId } },
      users: { connect: { id: domainEvent.createdBy } },
      id: domainEvent.id.toString(),
      title: domainEvent.title.value,
      description: domainEvent.description.value,
      event_time: domainEvent.schedule.eventTime,
      tracking_start_time: domainEvent.schedule.trackingStartTime,
      end_time: domainEvent.schedule.endTime,
      location_address: domainEvent.location.address,
      location_detail: domainEvent.location.detail.value,
      location_latitude: domainEvent.location.latitude,
      location_longitude: domainEvent.location.longitude,
      status: domainEvent.status,
      created_at: domainEvent.createdAt,
      updated_at: domainEvent.updatedAt,
    };
  }
}
