import {
  Controller,
  Get,
  Req,
  Res,
  Sse,
  Post,
  Body,
  Query,
  ParseUUIDPipe,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { UserAuth, User } from '../../../auth/decorators';
import { UserInfo } from '../../../auth/interfaces';
import {
  JoinShortTalkUseCase,
  LeaveShortTalkUseCase,
  SendShortTalkMessageUseCase,
  GetChatMessageListUseCase,
} from '../../application/usecases';
import { SseMessageEvent } from '../../domain/models/short-talk/short-talk-event';
import { SendShortTalkMessageRequestDto } from '../dtos/request/send-short-talk-message.request.dto';
import { GetChatMessageListRequestDto } from '../dtos/request/get-chat-message-list.request.dto';
import { SendShortTalkMessageResponseDto } from '../dtos/response/send-short-talk-message.response.dto';
import { ChatMessageListResponseDto } from '../dtos/response/chat-message-list.response.dto';

/**
 * Short Talk 컨트롤러
 *
 * 그룹 채팅 SSE 연결을 관리합니다.
 */
@ApiTags('사용자 - 모임 Short Talk')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'groups/:groupId/short-talk',
})
@UserAuth()
export class ShortTalkController {
  constructor(
    private readonly joinShortTalkUseCase: JoinShortTalkUseCase,
    private readonly leaveShortTalkUseCase: LeaveShortTalkUseCase,
    private readonly sendShortTalkMessageUseCase: SendShortTalkMessageUseCase,
    private readonly getChatMessageListUseCase: GetChatMessageListUseCase,
  ) {}

  /**
   * SSE 연결 (채팅방 입장)
   *
   * 그룹 채팅에 참여하여 실시간 메시지를 수신합니다.
   */
  @ApiOperation({
    summary: 'SSE 연결 (채팅방 입장)',
    description:
      '그룹 채팅에 참여하여 실시간 메시지를 수신합니다.<br><br>' +
      '**SSE 이벤트 타입 (data.type)**<br>' +
      '- `connected`: 연결 성공 (groupId, timestamp)<br>' +
      '- `message`: 새 메시지 (id, groupId, senderId, content, createdAt, timestamp)<br>' +
      '- `ping`: 30초 간격 Heartbeat (timestamp)<br>' +
      '- `error`: 연결 오류 (message, timestamp)<br><br>' +
      '**주의사항**<br>' +
      '- 클라이언트 연결 종료 시 자동으로 리스너 제거됩니다<br>' +
      '- 동일 사용자가 재연결 시 기존 연결은 자동 종료됩니다<br>' +
      '- 리스너 0명 시 세션이 자동 삭제됩니다<br>',
  })
  @ApiParam({
    name: 'groupId',
    description: '그룹 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description:
      'SSE 연결 성공 (text/event-stream)<br><br>' +
      '**connected 이벤트 예시**<br>' +
      '`{ type: "connected", groupId: "...", timestamp: "..." }`<br><br>' +
      '**message 이벤트 예시**<br>' +
      '`{ type: "message", id: "...", groupId: "...", senderId: "...", content: "...", createdAt: "...", timestamp: "..." }`',
  })
  @ApiForbiddenResponse({
    description: '모임 참여자가 아님: _**NOT_GROUP_MEMBER**_',
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
  })
  @Sse('stream')
  async joinShortTalk(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Observable<SseMessageEvent>> {
    // Nginx 프록시 버퍼링 비활성화 (실시간 스트리밍 보장)
    response.setHeader('X-Accel-Buffering', 'no');
    response.setHeader('Cache-Control', 'no-cache, no-transform');

    const observable = await this.joinShortTalkUseCase.execute({
      groupId,
      userId: user.userId,
    });

    // 연결 종료 시 자동 정리
    request.on('close', () => {
      this.leaveShortTalkUseCase.execute({
        groupId,
        userId: user.userId,
      });
    });

    return observable;
  }

  /**
   * 메시지 전송
   *
   * 그룹 채팅에 메시지를 전송합니다.
   */
  @ApiOperation({
    summary: '메시지 전송',
    description:
      '그룹 채팅에 메시지를 전송합니다.<br><br>' +
      '**필수 항목**<br>' +
      '메시지 내용 (content)<br><br>' +
      '**주의사항**<br>' +
      '- 전송된 메시지는 SSE를 통해 모든 참여자에게 브로드캐스트됩니다<br>' +
      '- 메시지는 최대 1000자, 10줄까지 입력 가능합니다<br>',
  })
  @ApiParam({
    name: 'groupId',
    description: '그룹 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiCreatedResponse({
    description: '메시지 전송 성공',
    type: SendShortTalkMessageResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패)<br>' +
      '**메시지 내용**<br>' +
      '- 메시지가 비어있는 경우: _**EMPTY_MESSAGE**_<br>' +
      '- 메시지가 너무 긴 경우 (최대 1000자): _**MESSAGE_TOO_LONG**_<br>' +
      '- 줄바꿈이 너무 많은 경우 (최대 10줄): _**TOO_MANY_LINES**_<br>',
  })
  @ApiForbiddenResponse({
    description: '모임 참여자가 아님: _**NOT_GROUP_MEMBER**_',
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
  })
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() body: SendShortTalkMessageRequestDto,
    @User() user: UserInfo,
  ): Promise<SendShortTalkMessageResponseDto> {
    const result = await this.sendShortTalkMessageUseCase.execute({
      groupId,
      senderId: user.userId,
      content: body.content,
    });

    return {
      id: result.id,
      createdAt: result.createdAt,
    };
  }

  /**
   * 메시지 히스토리 조회
   *
   * 그룹 채팅의 과거 메시지를 조회합니다.
   */
  @ApiOperation({
    summary: '메시지 히스토리 조회',
    description:
      '그룹 채팅의 과거 메시지를 조회합니다.<br><br>' +
      '**페이지네이션**<br>' +
      '- 커서 기반 페이지네이션 (최신순 정렬)<br>' +
      '- 첫 요청: cursor 없이 호출<br>' +
      '- 다음 페이지: 응답의 nextCursor 값 사용<br><br>' +
      '**주의사항**<br>' +
      '- 기본 조회 개수: 30개<br>' +
      '- 최대 조회 개수: 50개<br>',
  })
  @ApiParam({
    name: 'groupId',
    description: '그룹 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: '메시지 히스토리 조회 성공',
    type: ChatMessageListResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청<br>' +
      '- 유효하지 않은 커서: _**INVALID_CURSOR**_<br>' +
      '- 유효하지 않은 limit: _**INVALID_LIMIT**_<br>',
  })
  @ApiForbiddenResponse({
    description: '모임 참여자가 아님: _**NOT_GROUP_MEMBER**_',
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
  })
  @Get('messages')
  async getMessageList(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Query() query: GetChatMessageListRequestDto,
    @User() user: UserInfo,
  ): Promise<ChatMessageListResponseDto> {
    const result = await this.getChatMessageListUseCase.execute({
      groupId,
      userId: user.userId,
      cursor: query.cursor,
      limit: query.limit ?? 30,
    });

    return {
      items: result.items,
      nextCursor: result.nextCursor ?? null,
      hasMore: result.hasMore,
    };
  }
}
