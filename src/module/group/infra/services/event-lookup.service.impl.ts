import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { EventLookupService } from '../../domain/services';
import { event_status } from '@prisma/client';

@Injectable()
export class EventLookupServiceImpl implements EventLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async hasParticipatingInProgressEvent(
    userId: string,
    groupId: string,
  ): Promise<boolean> {
    const count = await this.prisma.events.count({
      where: {
        group_id: groupId,
        status: event_status.IN_PROGRESS,
        event_participants: {
          some: {
            user_id: userId,
          },
        },
      },
    });

    return count > 0;
  }

  async hasParticipatingRecruitingEventNearCheckTime(
    userId: string,
    groupId: string,
  ): Promise<boolean> {
    // 참여자 체크가 완료된 모집중 일정에 참여 중인지 확인
    const count = await this.prisma.events.count({
      where: {
        group_id: groupId,
        status: event_status.RECRUITING,
        is_participant_checked: true,
        event_participants: {
          some: {
            user_id: userId,
          },
        },
      },
    });

    return count > 0;
  }

  async hasCreatedActiveEvents(
    userId: string,
    groupId: string,
  ): Promise<boolean> {
    const count = await this.prisma.events.count({
      where: {
        group_id: groupId,
        created_by: userId,
        status: {
          in: [event_status.RECRUITING, event_status.IN_PROGRESS],
        },
      },
    });

    return count > 0;
  }

  async findWithdrawableEventIds(
    userId: string,
    groupId: string,
  ): Promise<string[]> {
    // 참여자 체크가 완료되지 않은 모집중 일정 (철회 가능)
    const events = await this.prisma.events.findMany({
      where: {
        group_id: groupId,
        status: event_status.RECRUITING,
        is_participant_checked: false,
        // 생성자가 아닌 일정만 (생성자는 철회 불가)
        NOT: {
          created_by: userId,
        },
        event_participants: {
          some: {
            user_id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return events.map((e) => e.id);
  }

  async withdrawFromEvents(userId: string, eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) {
      return;
    }

    await this.prisma.event_participants.deleteMany({
      where: {
        user_id: userId,
        event_id: {
          in: eventIds,
        },
      },
    });
  }
}
