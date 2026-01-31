import { Injectable } from '@nestjs/common';
import { AppVersionRepository } from '../../domain/repositories';
import { UpdateAppVersionDto } from '../dtos';
import { AppVersion, AppPlatform } from '../../domain/models';

/**
 * 앱 버전 수정 UseCase (관리자)
 *
 * 특정 플랫폼의 앱 버전 정보를 수정합니다.
 * 해당 플랫폼 버전 정보가 없으면 새로 생성합니다.
 */
@Injectable()
export class UpdateAppVersionUseCase {
  constructor(private readonly appVersionRepository: AppVersionRepository) {}

  async execute(dto: UpdateAppVersionDto): Promise<void> {
    const platform = AppPlatform.create(dto.platform);

    let appVersion = await this.appVersionRepository.findByPlatform(platform);
    if (!appVersion) {
      appVersion = AppVersion.create({
        platform,
        latestVersion: dto.latestVersion,
        minRequiredVersion: dto.minRequiredVersion,
        storeUrl: dto.storeUrl,
      });
    } else {
      appVersion.update(
        dto.latestVersion,
        dto.minRequiredVersion,
        dto.storeUrl,
      );
    }

    await this.appVersionRepository.save(appVersion);
  }
}
