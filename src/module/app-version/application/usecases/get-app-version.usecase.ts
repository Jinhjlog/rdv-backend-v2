import { Injectable } from '@nestjs/common';
import { AppVersionRepository } from '../../domain/repositories';
import { AppPlatform } from '../../domain/models';
import { GetAppVersionDto, GetAppVersionResultDto } from '../dtos';
import { EntityNotFoundException } from '@shared/exception';

/**
 * 앱 버전 조회 UseCase
 *
 * 특정 플랫폼의 앱 버전 정보를 조회합니다.
 */
@Injectable()
export class GetAppVersionUseCase {
  constructor(private readonly appVersionRepository: AppVersionRepository) {}

  async execute(dto: GetAppVersionDto): Promise<GetAppVersionResultDto> {
    const platform = AppPlatform.create(dto.platform);
    const appVersion = await this.appVersionRepository.findByPlatform(platform);

    if (!appVersion) {
      throw new EntityNotFoundException({
        entityName: 'AppVersion',
        errorCode: 'APP_VERSION_NOT_FOUND',
      });
    }

    return {
      latestVersion: appVersion.latestVersion,
      minRequiredVersion: appVersion.minRequiredVersion,
      storeUrl: appVersion.storeUrl,
    };
  }
}
