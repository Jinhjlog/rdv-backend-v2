import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserAuth, User } from '../../../auth/decorators';
import { UserInfo } from '../../../auth/interfaces';
import {
  GetNotificationListUseCase,
  GetUnreadCountUseCase,
  ReadNotificationUseCase,
  ReadAllNotificationsUseCase,
} from '../../application/usecases';
import { GetNotificationListRequestDto } from '../dtos/request';
import { ReadAllNotificationsRequestDto } from '../dtos/request';
import {
  NotificationListResponseDto,
  UnreadCountResponseDto,
  ReadNotificationResponseDto,
  ReadAllNotificationsResponseDto,
} from '../dtos/response';
import { NotificationTransformer } from '../transformers';

@ApiTags('사용자 - 알림')
@Controller({ path: 'notifications', version: '1' })
@UserAuth()
export class NotificationController {
  constructor(
    private readonly getNotificationListUseCase: GetNotificationListUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly readNotificationUseCase: ReadNotificationUseCase,
    private readonly readAllNotificationsUseCase: ReadAllNotificationsUseCase,
  ) {}

  /**
   * 알림 목록 조회
   */
  @ApiOperation({
    summary: '[사용자] 알림 목록 조회',
    description:
      '사용자의 알림 목록을 조회합니다.<br><br>' +
      '**선택 항목**<br>' +
      '알림 타입 필터, 커서, 조회 개수<br><br>' +
      '**페이지네이션**<br>' +
      '- 커서 기반 페이지네이션 (최신순 정렬)<br>' +
      '- 첫 요청: cursor 없이 호출<br>' +
      '- 다음 페이지: 응답의 nextCursor 값 사용<br>' +
      '- 기본 조회 개수: 20건 (최대 50건)<br><br>' +
      '**타입 필터**<br>' +
      '- MEETING, CHARACTER, ATTENDANCE, SYSTEM<br>' +
      '- 생략 시 전체 타입 조회<br>',
  })
  @ApiOkResponse({
    description: '알림 목록 조회 성공',
    type: NotificationListResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**type**<br>' +
      '- 유효하지 않은 알림 타입 (MEETING, CHARACTER, ATTENDANCE, SYSTEM 중 하나여야 함): _**INVALID_NOTIFICATION_TYPE**_<br>' +
      '<br>' +
      '**cursor**<br>' +
      '- 유효하지 않은 커서 형식 (Base64 인코딩된 커서 값이어야 함): _**INVALID_CURSOR**_<br>' +
      '<br>' +
      '**limit**<br>' +
      '- 조회 개수는 1~50 사이의 정수여야 합니다<br>',
  })
  @Get()
  async getList(
    @Query() query: GetNotificationListRequestDto,
    @User() user: UserInfo,
  ): Promise<{ data: NotificationListResponseDto }> {
    const result = await this.getNotificationListUseCase.execute({
      userId: user.userId,
      type: query.type?.toUpperCase(),
      cursor: query.cursor,
      limit: query.limit ?? 20,
    });

    return {
      data: NotificationTransformer.toListResponse(
        result.items,
        result.nextCursor,
        result.hasNext,
      ),
    };
  }

  /**
   * 미읽음 알림 개수 조회
   */
  @ApiOperation({
    summary: '[사용자] 미읽음 알림 개수 조회',
    description:
      '사용자의 미읽음 알림 개수를 조회합니다.<br>' +
      '홈 화면 벨 아이콘 뱃지 숫자에 사용됩니다.',
  })
  @ApiOkResponse({
    description: '미읽음 개수 조회 성공',
    type: UnreadCountResponseDto,
  })
  @Get('unread-count')
  async getUnreadCount(
    @User() user: UserInfo,
  ): Promise<{ data: UnreadCountResponseDto }> {
    const count = await this.getUnreadCountUseCase.execute(user.userId);
    return { data: { count } };
  }

  /**
   * 전체 알림 읽음 처리
   */
  @ApiOperation({
    summary: '[사용자] 전체 알림 읽음 처리',
    description:
      '사용자의 미읽음 알림을 일괄 읽음 처리합니다.<br>' +
      '처리된 알림 수를 반환합니다.<br><br>' +
      '**선택 항목**<br>' +
      '알림 타입 필터 (생략 시 전체 알림 일괄 읽음 처리)<br><br>' +
      '**타입 필터**<br>' +
      '- type 파라미터로 특정 타입만 읽음 처리 가능<br>' +
      '- MEETING, CHARACTER, ATTENDANCE, SYSTEM<br>',
  })
  @ApiOkResponse({
    description: '전체 읽음 처리 성공',
    type: ReadAllNotificationsResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**type**<br>' +
      '- 유효하지 않은 알림 타입 (MEETING, CHARACTER, ATTENDANCE, SYSTEM 중 하나여야 함): _**INVALID_NOTIFICATION_TYPE**_<br>',
  })
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async readAll(
    @Body() body: ReadAllNotificationsRequestDto,
    @User() user: UserInfo,
  ): Promise<{ data: ReadAllNotificationsResponseDto }> {
    const result = await this.readAllNotificationsUseCase.execute({
      userId: user.userId,
      type: body.type?.toUpperCase(),
    });

    return { data: { updatedCount: result.updatedCount } };
  }

  /**
   * 개별 알림 읽음 처리
   */
  @ApiOperation({
    summary: '[사용자] 개별 알림 읽음 처리',
    description:
      '특정 알림을 읽음 처리합니다.<br><br>' +
      '**주의사항**<br>' +
      '- 이미 읽음 상태인 알림에 다시 요청해도 에러 없이 현재 상태를 반환합니다 (멱등성 보장)<br>' +
      '- 본인 소유의 알림만 읽음 처리 가능합니다<br>',
  })
  @ApiOkResponse({
    description: '읽음 처리 성공',
    type: ReadNotificationResponseDto,
  })
  @ApiNotFoundResponse({
    description: '알림을 찾을 수 없음: _**NOTIFICATION_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**id**<br>' +
      '- 유효하지 않은 UUID 형식<br>' +
      '<br>' +
      '**접근 권한**<br>' +
      '- 본인 소유의 알림이 아닌 경우: _**NOTIFICATION_ACCESS_DENIED**_<br>',
  })
  @ApiParam({
    name: 'id',
    description: '알림 ID (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Patch(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  async read(
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
    @User() user: UserInfo,
  ): Promise<{ data: ReadNotificationResponseDto }> {
    const result = await this.readNotificationUseCase.execute({
      notificationId,
      userId: user.userId,
    });

    return {
      data: {
        id: result.id,
        isRead: result.isRead,
        readAt: result.readAt?.toISOString() ?? '',
      },
    };
  }
}
