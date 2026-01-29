import { Injectable, Logger } from '@nestjs/common';
import { RegisterDeviceTokenDto } from '../dtos/register-device-token.dto';
import { DeviceTokenRepository } from '../../domain/repositories';
import { DeviceToken } from '../../domain/models';
import { NotificationSenderService } from '@core/firebase/notification-sender.service';

/**
 * 디바이스 토큰 등록/갱신 UseCase
 *
 * - 동일 토큰이 이미 존재하면 lastUsedAt 갱신
 * - 다른 사용자의 토큰이면 소유권 이전 (기기 변경)
 * - 새 토큰이면 신규 등록
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

    // 2. 기존 토큰 확인
    const existingToken = await this.deviceTokenRepository.findByToken(
      dto.token,
    );

    if (existingToken) {
      // 동일 사용자의 토큰이면 lastUsedAt만 갱신
      if (existingToken.userId === dto.userId) {
        existingToken.refreshLastUsedAt();
        if (dto.deviceInfo) {
          existingToken.updateDeviceInfo(dto.deviceInfo);
        }
        await this.deviceTokenRepository.save(existingToken);
        this.logger.debug(
          `토큰 갱신 완료: userId=${dto.userId}, token=${dto.token.slice(0, 20)}...`,
        );
        return;
      }

      // 다른 사용자의 토큰이면 기존 토큰 삭제 (기기 소유권 이전)
      await this.deviceTokenRepository.deleteByToken(dto.token);
      this.logger.debug(
        `기존 토큰 삭제 (소유권 이전): prevUserId=${existingToken.userId}, newUserId=${dto.userId}`,
      );
    }

    // 3. 새 토큰 생성
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
