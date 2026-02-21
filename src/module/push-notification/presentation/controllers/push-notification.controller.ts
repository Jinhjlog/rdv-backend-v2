import { Controller, Post, Body, ForbiddenException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SendTestPushUseCase } from '../../application/usecases';
import { SendTestPushRequestDto, SendTestPushResponseDto } from '../dtos';

const TEST_API_KEY = 'wlsguswnsdmlzl';

@ApiTags('푸시 알림')
@Controller({ path: 'push-notifications', version: '1' })
export class PushNotificationController {
  constructor(private readonly sendTestPushUseCase: SendTestPushUseCase) {}

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
