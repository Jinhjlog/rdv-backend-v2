import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { SendTestPushUseCase } from '../../application/usecases';
import { SendTestPushRequestDto, SendTestPushResponseDto } from '../dtos';
import { AdminApiKeyGuard } from 'src/module/auth/guards';

@ApiTags('푸시 알림')
@UseGuards(AdminApiKeyGuard)
@ApiHeader({ name: 'x-api-key', description: '관리자 API 키', required: true })
@Controller({ path: 'push-notifications', version: '1' })
export class PushNotificationController {
  constructor(private readonly sendTestPushUseCase: SendTestPushUseCase) {}

  @ApiOperation({
    summary: '테스트 푸시 알림 발송 [테스트]',
    description:
      '특정 사용자에게 테스트 푸시 알림을 발송합니다.<br><br>' +
      '**인증**<br>' +
      '`x-api-key` 헤더에 관리자 API 키 필요<br><br>' +
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
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 API 키: _**INVALID_API_KEY**_',
  })
  @Post('test')
  async sendTestPush(
    @Body() dto: SendTestPushRequestDto,
  ): Promise<SendTestPushResponseDto> {
    return this.sendTestPushUseCase.execute({
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      data: dto.data,
    });
  }
}
