import { Injectable } from '@nestjs/common';
import { DomainRuleViolationException } from '@shared/exception';
import { EventRepository } from '../repositories';

/**
 * 모임 탈퇴 정책 도메인 서비스
 *
 * 모임 탈퇴 시 이벤트 관련 제약 조건을 검증하고 처리합니다.
 */
@Injectable()
export class GroupLeavePolicyService {
  constructor(private readonly eventRepository: EventRepository) {}

  /**
   * 이벤트 관련 탈퇴 조건 검증
   *
   * @throws {DomainRuleViolationException} CANNOT_LEAVE_DURING_EVENT_IN_PROGRESS - 진행중 일정 참여 중
   * @throws {DomainRuleViolationException} CANNOT_LEAVE_NEAR_PARTICIPANT_CHECK - 참여자 체크 시간 임박
   * @throws {DomainRuleViolationException} CANNOT_LEAVE_WITH_ACTIVE_EVENTS_CREATED - 생성한 활성 일정 존재
   */
  async validateLeaveConstraints(
    userId: string,
    groupId: string,
  ): Promise<void> {
    await this.validateNoInProgressEventParticipation(userId, groupId);
    await this.validateNoNearCheckTimeEventParticipation(userId, groupId);
    await this.validateNoActiveEventsCreated(userId, groupId);
  }

  /**
   * 철회 가능한 모집중 일정에서 자동 철회
   */
  async withdrawFromRecruitingEvents(
    userId: string,
    groupId: string,
  ): Promise<void> {
    const withdrawableEventIds =
      await this.eventRepository.findWithdrawableEventIds(userId, groupId);

    if (withdrawableEventIds.length > 0) {
      await this.eventRepository.withdrawFromEvents(
        userId,
        withdrawableEventIds,
      );
    }
  }

  /**
   * 진행중(IN_PROGRESS) 일정 참여 검증
   */
  private async validateNoInProgressEventParticipation(
    userId: string,
    groupId: string,
  ): Promise<void> {
    const hasInProgressEvent =
      await this.eventRepository.hasParticipatingInProgressEvent(
        userId,
        groupId,
      );

    if (hasInProgressEvent) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason: '진행중인 일정에 참여 중이므로 모임을 탈퇴할 수 없습니다.',
        errorCode: 'CANNOT_LEAVE_DURING_EVENT_IN_PROGRESS',
      });
    }
  }

  /**
   * 참여자 체크 시간 임박한 모집중 일정 참여 검증 (20분 이내)
   */
  private async validateNoNearCheckTimeEventParticipation(
    userId: string,
    groupId: string,
  ): Promise<void> {
    const hasNearCheckTimeEvent =
      await this.eventRepository.hasParticipatingRecruitingEventNearCheckTime(
        userId,
        groupId,
      );

    if (hasNearCheckTimeEvent) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason:
          '참여자 체크 시간이 임박한 일정이 있어 모임을 탈퇴할 수 없습니다.',
        errorCode: 'CANNOT_LEAVE_NEAR_PARTICIPANT_CHECK',
      });
    }
  }

  /**
   * 본인이 생성한 활성 일정 존재 검증
   */
  private async validateNoActiveEventsCreated(
    userId: string,
    groupId: string,
  ): Promise<void> {
    const hasCreatedActiveEvents =
      await this.eventRepository.hasCreatedActiveEvents(userId, groupId);

    if (hasCreatedActiveEvents) {
      throw new DomainRuleViolationException({
        entityName: 'Group',
        reason:
          '생성한 활성 일정이 있어 모임을 탈퇴할 수 없습니다. 일정을 삭제하거나 종료 후 탈퇴해주세요.',
        errorCode: 'CANNOT_LEAVE_WITH_ACTIVE_EVENTS_CREATED',
      });
    }
  }
}
