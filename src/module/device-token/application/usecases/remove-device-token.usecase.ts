import { Injectable, Logger } from '@nestjs/common';
import { RemoveDeviceTokenDto } from '../dtos/remove-device-token.dto';
import { DeviceTokenRepository } from '../../domain/repositories';

/**
 * 디바이스 토큰 삭제 UseCase
 *
 * 로그아웃 시 FCM 토큰을 삭제합니다.
 */
@Injectable()
export class RemoveDeviceTokenUseCase {
  private readonly logger = new Logger(RemoveDeviceTokenUseCase.name);

  constructor(private readonly deviceTokenRepository: DeviceTokenRepository) {}

  async execute(dto: RemoveDeviceTokenDto): Promise<void> {
    await this.deviceTokenRepository.deleteByToken(dto.token);
    this.logger.debug(`토큰 삭제 완료: token=${dto.token.slice(0, 20)}...`);
  }
}
