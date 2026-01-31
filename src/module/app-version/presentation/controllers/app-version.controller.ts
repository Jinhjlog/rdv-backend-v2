import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { GetAppVersionUseCase } from '../../application/usecases';
import { GetAppVersionRequestDto, AppVersionResponseDto } from '../dtos';

@ApiTags('공통 - 앱 버전')
@Controller({ path: 'app-versions', version: '1' })
export class AppVersionController {
  constructor(private readonly getAppVersionUseCase: GetAppVersionUseCase) {}

  @ApiOperation({
    summary: '[공개] - 앱 버전 정보 조회',
    description:
      '특정 플랫폼의 앱 버전 정보를 조회합니다.<br><br>' +
      '**인증 불필요**<br><br>' +
      '**필수 항목**<br>' +
      'platform (ANDROID 또는 IOS)<br><br>' +
      '**응답 정보**<br>' +
      '- latestVersion: 현재 배포된 최신 버전<br>' +
      '- minRequiredVersion: 앱 사용을 위한 최소 필수 버전<br>' +
      '- storeUrl: 해당 플랫폼 스토어 다운로드 URL<br><br>' +
      '**주의사항**<br>' +
      '- 현재 버전 < minRequiredVersion: 강제 업데이트 필요 (앱 사용 불가)<br>' +
      '- minRequiredVersion ≤ 현재 버전 < latestVersion: 선택적 업데이트 권장<br>' +
      '- 현재 버전 ≥ latestVersion: 업데이트 불필요<br>',
  })
  @ApiOkResponse({
    description: '앱 버전 정보 조회 성공',
    type: AppVersionResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**플랫폼**<br>' +
      '- 유효하지 않은 플랫폼 값인 경우 (ANDROID, IOS 외): _**PLATFORM_INVALID_VALUE**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '해당 플랫폼의 버전 정보가 등록되지 않음: _**APP_VERSION_NOT_FOUND**_',
  })
  @Get()
  async getAppVersion(
    @Query() query: GetAppVersionRequestDto,
  ): Promise<AppVersionResponseDto> {
    return this.getAppVersionUseCase.execute({
      platform: query.platform,
    });
  }
}
