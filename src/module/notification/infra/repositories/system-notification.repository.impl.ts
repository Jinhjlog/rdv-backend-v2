import { Injectable } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { SystemNotificationRepository } from '../../domain/repositories';
import { SystemNotification } from '../../domain/models';

/**
 * SystemNotification 이벤트 퍼블리셔 구현체
 *
 * DB 저장 없이 도메인 이벤트 디스패치만 수행합니다.
 * 기존 Repository 패턴과 동일하게 인프라 레이어에서 DomainEvents를 호출합니다.
 */
@Injectable()
export class SystemNotificationRepositoryImpl implements SystemNotificationRepository {
  save(aggregate: SystemNotification): void {
    if (aggregate.domainEvents.length > 0) {
      DomainEvents.dispatchEventsForAggregate(aggregate.id);
    }
  }
}
