import { Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/repositories';
import { Event } from '../../domain/models';
import { PrismaService } from '@core/database/prisma.service';
import {
  EventMapper,
  EventParticipantMapper,
  EventResultMapper,
} from '../mappers';
import { TransactionContextService } from '@lib/infra/unit-of-work';
import { PrismaTransactionClient } from '@core/database';
import { event_status } from '@prisma/client';
import { DomainEvents } from '@lib/domain/events/domain-events';

@Injectable()
export class EventRepositoryImpl implements EventRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: TransactionContextService<PrismaTransactionClient>,
  ) {}

  private get client(): PrismaService | PrismaTransactionClient {
    const tx = this.txContext.getTransactionContext();
    return tx ?? this.prisma;
  }

  /**
   * Event Aggregate Root를 저장합니다
   *
   * 트랜잭션 관리:
   * - UnitOfWork 컨텍스트 내부: 외부 트랜잭션 재사용 (txContext를 통해 자동 주입)
   * - UnitOfWork 없이 호출: 내부에서 새 트랜잭션 생성
   *
   * 저장 작업:
   * 1. Event (Aggregate Root) 저장/업데이트
   *
   * @param {Event} event 저장할 Event Aggregate Root
   */
  async save(event: Event): Promise<void> {
    // 이미 트랜잭션 컨텍스트 내부라면 현재 트랜잭션 재사용
    if (this.txContext.isInTransaction()) {
      await this._saveWithClient(this.client, event);
      return;
    }

    // 트랜잭션이 없으면 새로 시작 (Aggregate 일관성 보장)
    await this.prisma.$transaction(async (tx) => {
      await this._saveWithClient(tx, event);
    });

    if (event.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(event.id);
    }
  }

  async delete(event: Event): Promise<void> {
    const id = event.id.toString();

    // 이미 트랜잭션 컨텍스트 내부라면 현재 트랜잭션 재사용
    if (this.txContext.isInTransaction()) {
      await this._deleteWithClient(this.client, id);
      return;
    }

    // 트랜잭션이 없으면 새로 시작
    await this.prisma.$transaction(async (tx) => {
      await this._deleteWithClient(tx, id);
    });

    if (event.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(event.id);
    }
  }

  private async _deleteWithClient(
    client: PrismaService | PrismaTransactionClient,
    id: string,
  ): Promise<void> {
    // 참여자 삭제
    await client.event_participants.deleteMany({
      where: { event_id: id },
    });

    // 결과 삭제
    await client.event_results.deleteMany({
      where: { event_id: id },
    });

    // 이벤트 삭제
    await client.events.delete({
      where: { id },
    });
  }

  /**
   * 실제 저장 로직 (트랜잭션 클라이언트 사용)
   */
  private async _saveWithClient(
    client: PrismaService | PrismaTransactionClient,
    event: Event,
  ): Promise<void> {
    // 0. 새로 생성된 Event인지 확인 (upsert 전에 존재 여부 체크)
    const existingEvent = await client.events.findUnique({
      where: { id: event.id.toString() },
      select: { created_at: true },
    });
    const isNewEvent = !existingEvent;

    // 1. Event (Aggregate Root) 저장
    const eventData = EventMapper.toPersistence(event);

    await client.events.upsert({
      where: { id: event.id.toString() },
      update: eventData,
      create: eventData,
    });

    // 1-1. 새로 생성된 경우, 생성자를 참여자에 자동 추가
    if (isNewEvent) {
      await client.event_participants.create({
        data: {
          event_id: event.id.toString(),
          user_id: event.createdBy,
          status: 'PREPARING',
        },
      });
    }

    // 2. 명시적으로 삭제 요청된 참여자만 삭제
    const removedParticipantIds = event.removedParticipantIds;
    if (removedParticipantIds.length > 0) {
      await client.event_participants.deleteMany({
        where: { id: { in: [...removedParticipantIds] } },
      });
      event.clearRemovedParticipantIds();
    }

    // 3. 멤버 저장/업데이트 (배치 처리)
    if (event.participants.length > 0) {
      await Promise.all(
        event.participants.map((participant) => {
          const participantData =
            EventParticipantMapper.toPersistence(participant);

          return client.event_participants.upsert({
            where: { id: participant.id.toString() },
            update: participantData,
            create: participantData,
          });
        }),
      );
    }

    // 4. Event Results 저장/업데이트
    if (event.results.length > 0) {
      await Promise.all(
        event.results.map((result) => {
          const resultData = EventResultMapper.toPersistence(result);

          return client.event_results.upsert({
            where: { id: result.id.toString() },
            update: resultData,
            create: resultData,
          });
        }),
      );
    }
  }

  async findById(id: string): Promise<Event | undefined> {
    const prismaEvent = await this.client.events.findUnique({
      where: { id },
      include: {
        event_participants: true,
        event_results: true,
      },
    });
    if (!prismaEvent) {
      return undefined;
    }

    const eventParticipants = prismaEvent.event_participants.map(
      (participant) => EventParticipantMapper.toDomain(participant),
    );

    const eventResults = prismaEvent.event_results.map((result) =>
      EventResultMapper.toDomain(result),
    );

    return EventMapper.toDomain(prismaEvent, eventParticipants, eventResults);
  }

  async findRecurringEventCountByGroupId(groupId: string): Promise<number> {
    const count = await this.client.events.count({
      where: {
        group_id: groupId,
        status: event_status.RECRUITING,
      },
    });
    return count;
  }

  async hasScheduleConflict(
    userId: string,
    trackingStartTime: Date,
    endTime: Date,
    excludeEventId?: string,
  ): Promise<boolean> {
    let result: { count: bigint }[];

    if (excludeEventId) {
      result = await this.client.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint as count
        FROM public.events e
        JOIN public.event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = ${userId}::uuid
          AND e.status IN ('RECRUITING', 'IN_PROGRESS')
          AND e.id != ${excludeEventId}::uuid
          AND NOT (e.end_time <= ${trackingStartTime} OR e.tracking_start_time >= ${endTime})
      `;
    } else {
      result = await this.client.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint as count
        FROM public.events e
        JOIN public.event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = ${userId}::uuid
          AND e.status IN ('RECRUITING', 'IN_PROGRESS')
          AND NOT (e.end_time <= ${trackingStartTime} OR e.tracking_start_time >= ${endTime})
      `;
    }

    return Number(result[0].count) > 0;
  }
}
