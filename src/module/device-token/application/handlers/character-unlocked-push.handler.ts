import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@lib/domain/events/domain-events';
import { CharacterUnlockedEvent } from '../../../character/domain/events';
import { DeviceTokenRepository } from '../../domain/repositories';
import { NotificationSenderService } from '@core/firebase/notification-sender.service';

/**
 * 캐릭터 언락 시 사일런트 푸시 발송 핸들러
 *
 * CharacterUnlockedEvent를 수신하여 해당 사용자에게 사일런트 푸시를 발송합니다.
 */
@Injectable()
export class CharacterUnlockedPushHandler implements OnModuleInit {
  private readonly logger = new Logger(CharacterUnlockedPushHandler.name);

  constructor(
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly notificationSenderService: NotificationSenderService,
  ) {}

  onModuleInit() {
    DomainEvents.register(
      (event: CharacterUnlockedEvent) => void this.handle(event),
      CharacterUnlockedEvent.name,
    );
  }

  async handle(event: CharacterUnlockedEvent): Promise<void> {
    const userId = event.aggregateId.toString();
    const { characterCode, name } = event.metadata;

    this.logger.log(
      `캐릭터 언락 푸시 핸들러: userId=${userId}, character=${name}`,
    );

    // 사용자의 디바이스 토큰 조회
    const deviceTokens = await this.deviceTokenRepository.findByUserIds([
      userId,
    ]);
    const tokens = deviceTokens.map((dt) => dt.token);

    if (tokens.length === 0) {
      this.logger.warn(
        `푸시 발송 대상 없음: userId=${userId} (등록된 토큰 없음)`,
      );
      return;
    }

    // 사일런트 푸시 발송
    const response =
      await this.notificationSenderService.sendSilentPushToMultipleDevices(
        tokens,
        {
          type: 'CHARACTER_UNLOCKED',
          characterCode,
          name: name,
        },
      );

    this.logger.log(
      `사일런트 푸시 발송 완료: userId=${userId}, character=${name}, 성공=${response.successCount}, 실패=${response.failureCount}`,
    );
  }
}
