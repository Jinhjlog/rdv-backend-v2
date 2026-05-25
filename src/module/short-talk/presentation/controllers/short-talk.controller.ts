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
import { SseMessageEvent } from '../../application/ports';
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
    description: `그룹 채팅에 참여하여 실시간 메시지를 수신합니다.

## 이벤트 타입별 응답 형식

### 1. connected (연결 성공)
SSE 연결이 성공하면 즉시 전송됩니다.
\`\`\`json
{
  "type": "connected",
  "groupId": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-01-24T12:00:00.000Z"
}
\`\`\`

| 필드 | 타입 | 설명 |
|------|------|------|
| type | string | 이벤트 타입 (connected) |
| groupId | string | 연결된 그룹 ID |
| timestamp | string | 연결 시각 (ISO 8601) |

---

### 2. message (새 메시지)
다른 사용자가 메시지를 전송하면 브로드캐스트됩니다.
\`\`\`json
{
  "type": "message",
  "id": "msg-uuid-1234",
  "groupId": "123e4567-e89b-12d3-a456-426614174000",
  "senderId": "user-uuid-5678",
  "content": "안녕하세요!",
  "createdAt": "2025-01-24T12:00:00.000Z",
  "timestamp": "2025-01-24T12:00:00.000Z",
  "sender": {
    "id": "user-uuid-5678",
    "nickname": "홍길동",
    "nameTag": "#1234",
    "characterCode": "brown_dog",
    "preferredThemeColor": "#FFD700"
  }
}
\`\`\`

| 필드 | 타입 | 설명 |
|------|------|------|
| type | string | 이벤트 타입 (message) |
| id | string | 메시지 ID |
| groupId | string | 그룹 ID |
| senderId | string | 발신자 ID |
| content | string | 메시지 내용 |
| createdAt | string | 메시지 생성 시각 (ISO 8601) |
| timestamp | string | 이벤트 전송 시각 (ISO 8601) |
| sender | object | 발신자 정보 |
| sender.id | string | 발신자 ID |
| sender.nickname | string | 발신자 닉네임 |
| sender.nameTag | string | 발신자 태그 |
| sender.characterCode | string | 캐릭터 코드 |
| sender.preferredThemeColor | string | 선호 테마 색상 (HEX) |

---

### 3. ping (Heartbeat)
30초 간격으로 연결 유지를 위해 전송됩니다.
\`\`\`json
{
  "type": "ping",
  "timestamp": "2025-01-24T12:00:30.000Z"
}
\`\`\`

| 필드 | 타입 | 설명 |
|------|------|------|
| type | string | 이벤트 타입 (ping) |
| timestamp | string | 전송 시각 (ISO 8601) |

---

### 4. error (연결 오류)
연결 중 오류 발생 시 전송됩니다.
\`\`\`json
{
  "type": "error",
  "message": "연결 오류가 발생했습니다",
  "timestamp": "2025-01-24T12:00:00.000Z"
}
\`\`\`

| 필드 | 타입 | 설명 |
|------|------|------|
| type | string | 이벤트 타입 (error) |
| message | string | 오류 메시지 |
| timestamp | string | 오류 발생 시각 (ISO 8601) |

---

## 주의사항
- 클라이언트 연결 종료 시 자동으로 리스너 제거됩니다
- 동일 사용자가 재연결 시 기존 연결은 자동 종료됩니다
- 리스너 0명 시 세션이 자동 삭제됩니다
`,
  })
  @ApiParam({
    name: 'groupId',
    description: '그룹 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'SSE 연결 성공 (Content-Type: text/event-stream)',
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
      '**놓친 메시지 동기화 (sinceId)**<br>' +
      '- 백그라운드에서 복귀 시 SSE 연결 끊김으로 놓친 메시지 조회용<br>' +
      '- sinceId: 마지막으로 받은 메시지 ID (해당 ID 이후 메시지만 반환)<br>' +
      '- 예시: `?sinceId=550e8400-e29b-41d4-a716-446655440000`<br><br>' +
      '**주의사항**<br>' +
      '- 기본 조회 개수: 30개<br>' +
      '- 최대 조회 개수: 50개<br>' +
      '- cursor와 sinceId는 동시 사용 불가 (sinceId 우선)<br>',
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
      cursor: query.sinceId ? undefined : query.cursor, // sinceId 사용 시 cursor 무시
      sinceId: query.sinceId,
      limit: query.limit ?? 30,
    });

    return {
      items: result.items,
      nextCursor: result.nextCursor ?? null,
      hasMore: result.hasMore,
    };
  }
}
