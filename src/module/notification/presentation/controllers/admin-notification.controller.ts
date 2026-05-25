import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { AdminApiKeyGuard } from '../../../auth/guards';
import { BroadcastSystemNotificationUseCase } from '../../application/usecases';
import { BroadcastNotificationRequestDto } from '../dtos/request';
import { BroadcastNotificationResponseDto } from '../dtos/response';

@ApiTags('관리자 - 알림')
@ApiHeader({ name: 'x-api-key', description: '관리자 API 키', required: true })
@UseGuards(AdminApiKeyGuard)
@Controller({ path: 'admin/notifications', version: '1' })
export class AdminNotificationController {
  constructor(
    private readonly broadcastSystemNotificationUseCase: BroadcastSystemNotificationUseCase,
  ) {}

  @ApiOperation({
    summary: '[관리자] 시스템 공지 전체 전송',
    description:
      '전체 유저에게 시스템 공지 알림을 전송합니다.<br><br>' +
      '**처리 방식**<br>' +
      '- 모든 유저의 알림함에 SYSTEM 타입 알림 생성 (Fan-out on Write)<br>' +
      '- sendPush=true 시 FCM 푸시 알림도 함께 전송<br>' +
      '- sendPush=false 시 인앱 알림함에만 저장<br>',
  })
  @ApiOkResponse({
    description: '브로드캐스트 성공',
    type: BroadcastNotificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 (필드 검증 실패)',
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 관리자 API 키: _**INVALID_API_KEY**_',
  })
  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  async broadcast(
    @Body() body: BroadcastNotificationRequestDto,
  ): Promise<{ data: BroadcastNotificationResponseDto }> {
    const result = await this.broadcastSystemNotificationUseCase.execute({
      title: body.title,
      subtitle: body.subtitle,
      sendPush: body.sendPush ?? false,
    });

    return { data: { notifiedUserCount: result.notifiedUserCount } };
  }
}
