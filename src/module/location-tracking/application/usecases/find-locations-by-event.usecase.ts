import { Injectable } from '@nestjs/common';
import { DomainAuthorizationException } from '@shared/exception';
import {
  LocationTrackingQueryService,
  EventLookupService,
} from '../../domain/services';
import { LocationTrackingReadModel } from '../../domain/models';
import { FindLocationsByEventDto } from '../dtos';

export interface FindLocationsByEventResult {
  items: LocationTrackingReadModel[];
  pollingIntervalSeconds: number;
}

/**
 * 일정별 위치 목록 조회 유즈케이스
 *
 * 1. 그룹 멤버십 검증
 * 2. 참여자 위치 목록 조회
 * 3. 남은 시간 기반 폴링 간격 계산
 */
@Injectable()
export class FindLocationsByEventUseCase {
  constructor(
    private readonly eventLookupService: EventLookupService,
    private readonly locationTrackingQueryService: LocationTrackingQueryService,
  ) {}

  async execute(
    dto: FindLocationsByEventDto,
  ): Promise<FindLocationsByEventResult> {
    const isMember = await this.eventLookupService.isGroupMemberOfEvent(
      dto.eventId,
      dto.userId,
    );
    if (!isMember) {
      throw new DomainAuthorizationException({
        errorCode: 'NOT_GROUP_MEMBER',
        message: '모임 멤버만 위치를 조회할 수 있습니다',
      });
    }

    const [items, eventTime] = await Promise.all([
      this.locationTrackingQueryService.findByEventId({
        eventId: dto.eventId,
      }),
      this.eventLookupService.findEventTimeById(dto.eventId),
    ]);

    const pollingIntervalSeconds = this.calculatePollingInterval(eventTime);

    return { items, pollingIntervalSeconds };
  }

  /**
   * 약속 시간까지 남은 시간에 따라 폴링 간격을 계산합니다.
   *
   * - 10분 초과: 30초
   * - 5분 초과 ~ 10분 이하: 15초
   * - 5분 이하: 5초
   */
  private calculatePollingInterval(eventTime?: Date): number {
    if (!eventTime) return 30;

    const remainingMinutes = (eventTime.getTime() - Date.now()) / (60 * 1000);

    if (remainingMinutes > 10) return 30;
    if (remainingMinutes > 5) return 15;
    return 5;
  }
}
