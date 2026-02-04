import { UniqueEntityId } from '@lib/domain';
import { IDomainEvent } from '@lib/domain/events/i-domain-event';

export interface CharacterUnlockedEventData {
  userId: string;
  characterId: string;
  characterCode: string;
  name: string;
}

/**
 * 캐릭터 언락 이벤트
 *
 * 사용자가 캐릭터를 언락했을 때 발행됩니다.
 * 사일런트 푸시 발송 등을 처리합니다.
 */
export class CharacterUnlockedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;

  constructor(
    public readonly aggregateId: UniqueEntityId,
    public readonly metadata: CharacterUnlockedEventData,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.aggregateId;
  }
}
