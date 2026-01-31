import { Controller, Put, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UpdateAppVersionUseCase } from '../../application/usecases';
import { UpdateAppVersionRequestDto } from '../dtos';

@ApiTags('관리자 - 앱 버전')
@Controller({ path: 'admin/app-versions', version: '1' })
export class AdminAppVersionController {
  constructor(
    private readonly updateAppVersionUseCase: UpdateAppVersionUseCase,
  ) {}

  @ApiOperation({
    summary: '[관리자] - 앱 버전 정보 수정',
    description:
      '특정 플랫폼의 앱 버전 정보를 수정합니다.<br><br>' +
      '**필수 항목**<br>' +
      '플랫폼, 최신 버전, 최소 필수 버전, 스토어 URL<br><br>' +
      '**플랫폼 종류**<br>' +
      '- ANDROID: Android 앱<br>' +
      '- IOS: iOS 앱<br><br>' +
      '**주의사항**<br>' +
      '- 버전은 Semantic Versioning 형식이어야 합니다 (예: 1.2.0)<br>' +
      '- 해당 플랫폼 정보가 없으면 새로 생성됩니다<br>' +
      '- 해당 플랫폼 정보가 있으면 업데이트됩니다<br>',
  })
  @ApiNoContentResponse({
    description: '앱 버전 정보 수정 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**플랫폼**<br>' +
      '- 유효하지 않은 플랫폼 값인 경우 (ANDROID, IOS 외): _**PLATFORM_INVALID_VALUE**_<br>' +
      '<br>' +
      '**최신 버전**<br>' +
      '- 버전 형식이 올바르지 않은 경우 (Semantic Versioning 형식 필요): _**VALIDATION_ERROR**_<br>' +
      '<br>' +
      '**최소 필수 버전**<br>' +
      '- 버전 형식이 올바르지 않은 경우 (Semantic Versioning 형식 필요): _**VALIDATION_ERROR**_<br>' +
      '<br>' +
      '**스토어 URL**<br>' +
      '- URL 형식이 올바르지 않은 경우: _**VALIDATION_ERROR**_<br>',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put()
  async updateAppVersion(
    @Body() dto: UpdateAppVersionRequestDto,
  ): Promise<void> {
    await this.updateAppVersionUseCase.execute({
      platform: dto.platform,
      latestVersion: dto.latestVersion,
      minRequiredVersion: dto.minRequiredVersion,
      storeUrl: dto.storeUrl,
    });
  }
}
