import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FindEventListUseCase } from '../../application/usecases';
import { User, UserAuth } from 'src/module/auth/decorators';
import { EventListResponseDto } from '../dtos';
import { UserInfo } from 'src/module/auth/interfaces';
import { EventTransformer } from '../transformers';

@ApiTags('사용자 - Event 관리')
@Controller({ path: 'group/:groupId/events', version: '1' })
export class UserEventController {
  constructor(private readonly findEventListUseCase: FindEventListUseCase) {}

  @ApiOperation({
    summary: '사용자 - 모임 일정 목록 조회',
    description:
      '특정 모임의 일정 목록을 조회합니다.<br><br>' +
      '**목적**<br>' +
      '특정 모임에 속한 일정 목록을 조회하여 일정 관리 UI를 지원합니다.<br><br>' +
      '**응답 구조**<br>' +
      '- items: 일정 배열<br>' +
      '  - id: 일정 고유 ID<br>' +
      '  - title: 일정 제목<br>' +
      '  - eventTime: 일정 날짜/시간<br>' +
      '  - locationAddress: 도로명 주소<br>' +
      '  - locationDetail: 상세 주소<br>' +
      '  - status: 일정 상태 (RECRUITING/IN_PROGRESS/ENDED)<br>' +
      '  - participants: 참여자 목록<br>' +
      '  - maxParticipants: 최대 참여자 수<br>' +
      '  - createdAt: 생성일<br>' +
      '  - updatedAt: 수정일<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- groupId는 UUID 형식이어야 합니다.<br>' +
      '- 해당 모임에 참여한 사용자만 일정을 조회할 수 있습니다.<br>',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiOkResponse({
    description: '일정 목록 조회 성공',
    type: EventListResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get()
  async getEventList(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
  ): Promise<EventListResponseDto> {
    const events = await this.findEventListUseCase.execute({
      userId: user.userId,
      groupId: groupId,
    });

    return EventTransformer.toListResponse(events);
  }
}
