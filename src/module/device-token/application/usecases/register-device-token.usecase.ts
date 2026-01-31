import { Injectable, Logger } from '@nestjs/common';
import { RegisterDeviceTokenDto } from '../dtos/register-device-token.dto';
import { DeviceTokenRepository } from '../../domain/repositories';
import { DeviceToken } from '../../domain/models';
import { NotificationSenderService } from '@core/firebase/notification-sender.service';

/**
 * 디바이스 토큰 등록 UseCase
 *
 * 사용자당 1개의 디바이스 토큰만 허용 (1:1 관계)
 * - FCM 토큰 유효성 검증
 * - 동일 FCM 토큰이 다른 사용자에게 있으면 삭제 (기기 소유권 이전)
 * - 사용자의 기존 토큰 삭제 후 새 토큰 등록
 */
@Injectable()
export class RegisterDeviceTokenUseCase {
  private readonly logger = new Logger(RegisterDeviceTokenUseCase.name);

  constructor(
    private readonly deviceTokenRepository: DeviceTokenRepository,
    private readonly notificationSenderService: NotificationSenderService,
  ) {}

  async execute(dto: RegisterDeviceTokenDto): Promise<void> {
    // 1. 토큰 유효성 검증 (FCM dry-run)
    const isValid = await this.notificationSenderService.validateToken(
      dto.token,
    );
    if (!isValid) {
      this.logger.warn(`유효하지 않은 FCM 토큰: ${dto.token.slice(0, 20)}...`);
      return;
    }

    // 2. 동일 FCM 토큰이 다른 사용자에게 있으면 삭제 (기기 소유권 이전)
    const existingByToken = await this.deviceTokenRepository.findByToken(
      dto.token,
    );
    if (existingByToken && existingByToken.userId !== dto.userId) {
      await this.deviceTokenRepository.deleteByToken(dto.token);
      this.logger.debug(
        `기존 토큰 삭제 (소유권 이전): prevUserId=${existingByToken.userId}, newUserId=${dto.userId}`,
      );
    }

    // 3. 사용자의 기존 토큰 삭제 (1:1 관계 강제)
    await this.deviceTokenRepository.deleteByUserId(dto.userId);

    // 4. 새 토큰 생성 및 저장
    const deviceToken = DeviceToken.create({
      userId: dto.userId,
      token: dto.token,
      platform: dto.platform,
      deviceInfo: dto.deviceInfo,
      lastUsedAt: new Date(),
    });

    await this.deviceTokenRepository.save(deviceToken);
    this.logger.debug(
      `새 토큰 등록 완료: userId=${dto.userId}, platform=${dto.platform}`,
    );
  }
}
