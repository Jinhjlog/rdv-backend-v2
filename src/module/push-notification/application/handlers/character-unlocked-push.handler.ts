import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { CharacterUnlockedEvent } from '../../../character/domain/events';
import { SilentPushType } from '../../domain/constants';
import { PushDispatchService } from '../services';

/**
 * 캐릭터 언락 시 사일런트 푸시 발송 핸들러
 *
 * CharacterUnlockedEvent를 수신하여 해당 사용자에게 사일런트 푸시를 발송합니다.
 */
@Injectable()
export class CharacterUnlockedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(CharacterUnlockedPushHandler.name);

  constructor(private readonly pushDispatchService: PushDispatchService) {}

  onModuleInit() {
    DomainEvents.register(
      (event: CharacterUnlockedEvent) => void this.handle(event),
      CharacterUnlockedEvent.name,
    );
  }

  async handle(event: CharacterUnlockedEvent): Promise<void> {
    const { userId, characterCode, name } = event.metadata;

    this.logger.log(
      `캐릭터 언락 푸시 핸들러: userId=${userId}, character=${name}`,
    );

    const result = await this.pushDispatchService.sendSilentPush({
      userIds: [userId],
      data: {
        type: SilentPushType.CharacterUnlocked,
        characterCode,
        name,
      },
    });

    if (!result.sent) {
      this.logger.warn(
        `푸시 발송 대상 없음: userId=${userId} (등록된 토큰 없음)`,
      );
      return;
    }

    this.logger.log(
      `사일런트 푸시 발송 완료: userId=${userId}, character=${name}, 성공=${result.successCount}, 실패=${result.failureCount}`,
    );
  }
}
