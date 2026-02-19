import { SystemNotification } from '../models';

/**
 * SystemNotification 이벤트 퍼블리셔 인터페이스
 *
 * DB 저장은 하지 않으며, 도메인 이벤트 디스패치 책임만 갖습니다.
 * 인프라 레이어에서 DomainEvents.dispatchEventsForAggregate()를 호출합니다.
 */
export abstract class SystemNotificationRepository {
  abstract save(aggregate: SystemNotification): void;
}
