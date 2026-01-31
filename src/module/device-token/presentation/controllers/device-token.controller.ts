import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserAuth, User } from '../../../auth/decorators';
import { UserInfo } from '../../../auth/interfaces';
import {
  RegisterDeviceTokenUseCase,
  RemoveDeviceTokenUseCase,
  SendTestPushUseCase,
} from '../../application/usecases';
import {
  RegisterDeviceTokenRequestDto,
  RemoveDeviceTokenRequestDto,
  SendTestPushRequestDto,
  SendTestPushResponseDto,
} from '../dtos';

const TEST_API_KEY = 'wlsguswnsdmlzl';

@ApiTags('사용자 - 디바이스 토큰')
@Controller({ path: 'device-tokens', version: '1' })
export class DeviceTokenController {
  constructor(
    private readonly registerDeviceTokenUseCase: RegisterDeviceTokenUseCase,
    private readonly removeDeviceTokenUseCase: RemoveDeviceTokenUseCase,
    private readonly sendTestPushUseCase: SendTestPushUseCase,
  ) {}

  @ApiOperation({
    summary: '디바이스 토큰 등록 [사용자]',
    description:
      'FCM 푸시 알림을 위한 디바이스 토큰을 등록합니다.<br><br>' +
      '**사용자당 1개의 디바이스 토큰만 허용됩니다 (1:1 관계)**<br><br>' +
      '**필수 항목**<br>' +
      'FCM 디바이스 토큰, 플랫폼 타입 (IOS 또는 ANDROID)<br><br>' +
      '**선택 항목**<br>' +
      '디바이스 정보 (모델명, OS 버전 등)<br><br>' +
      '**동작 방식**<br>' +
      '1. FCM dry-run으로 토큰 유효성 검증<br>' +
      '2. 동일 FCM 토큰이 다른 사용자에게 있으면 삭제 (기기 소유권 이전)<br>' +
      '3. 사용자의 기존 토큰 삭제 후 새 토큰 등록<br><br>' +
      '**주의사항**<br>' +
      '- 앱 시작 시 매번 호출하여 토큰을 등록하는 것을 권장합니다.<br>' +
      '- FCM 검증에 실패한 유효하지 않은 토큰은 자동으로 무시됩니다.<br>' +
      '- 새 토큰 등록 시 기존 토큰은 자동으로 삭제됩니다.<br>',
  })
  @ApiNoContentResponse({
    description: '토큰 등록/갱신 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패)<br>' +
      '**token**<br>' +
      '- 토큰이 비어있는 경우: _**VALIDATION_ERROR**_<br>' +
      '- 토큰이 문자열이 아닌 경우: _**VALIDATION_ERROR**_<br>' +
      '<br>' +
      '**platform**<br>' +
      '- 플랫폼이 비어있는 경우: _**VALIDATION_ERROR**_<br>' +
      '- 플랫폼이 IOS 또는 ANDROID가 아닌 경우: _**VALIDATION_ERROR**_<br>' +
      '<br>' +
      '**deviceInfo**<br>' +
      '- deviceInfo가 문자열이 아닌 경우: _**VALIDATION_ERROR**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  async registerDeviceToken(
    @Body() dto: RegisterDeviceTokenRequestDto,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.registerDeviceTokenUseCase.execute({
      userId: user.userId,
      token: dto.token,
      platform: dto.platform,
      deviceInfo: dto.deviceInfo,
    });
  }

  @ApiOperation({
    summary: '디바이스 토큰 삭제 [사용자]',
    description:
      '등록된 FCM 디바이스 토큰을 삭제합니다.<br><br>' +
      '**필수 항목**<br>' +
      'FCM 디바이스 토큰<br><br>' +
      '**주의사항**<br>' +
      '- 로그아웃 시 반드시 호출해야 합니다.<br>' +
      '- 존재하지 않는 토큰을 삭제해도 에러가 발생하지 않습니다 (멱등성 보장).<br>' +
      '- 삭제 후 해당 기기로 푸시 알림이 전송되지 않습니다.<br>',
  })
  @ApiNoContentResponse({
    description: '토큰 삭제 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**token**<br>' +
      '- 토큰이 비어있는 경우: _**ValidationError**_<br>' +
      '- 토큰이 문자열이 아닌 경우: _**ValidationError**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async removeDeviceToken(
    @Body() dto: RemoveDeviceTokenRequestDto,
  ): Promise<void> {
    await this.removeDeviceTokenUseCase.execute({
      token: dto.token,
    });
  }

  @ApiOperation({
    summary: '테스트 푸시 알림 발송 [테스트]',
    description:
      '특정 사용자에게 테스트 푸시 알림을 발송합니다.<br><br>' +
      '**필수 항목**<br>' +
      '- userId: 푸시 알림을 받을 사용자 ID<br>' +
      '- title: 알림 제목<br>' +
      '- body: 알림 내용<br><br>' +
      '**선택 항목**<br>' +
      '- data: 추가 데이터 (key-value 형태)<br><br>' +
      '**주의사항**<br>' +
      '- 테스트 용도로만 사용하세요.<br>' +
      '- 사용자당 1개의 디바이스 토큰만 존재합니다.<br>',
  })
  @ApiOkResponse({
    description: '푸시 알림 발송 결과',
    type: SendTestPushResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패)<br>' +
      '**userId**<br>' +
      '- userId가 비어있는 경우: _**VALIDATION_ERROR**_<br>' +
      '<br>' +
      '**title**<br>' +
      '- title이 비어있는 경우: _**VALIDATION_ERROR**_<br>' +
      '<br>' +
      '**body**<br>' +
      '- body가 비어있는 경우: _**VALIDATION_ERROR**_<br>',
  })
  @Post('test')
  async sendTestPush(
    @Body() dto: SendTestPushRequestDto,
  ): Promise<SendTestPushResponseDto> {
    if (dto.testKey !== TEST_API_KEY) {
      throw new ForbiddenException('유효하지 않은 테스트 키입니다.');
    }

    return this.sendTestPushUseCase.execute({
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      data: dto.data,
    });
  }
}
