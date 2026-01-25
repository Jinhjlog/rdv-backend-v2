import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import {
  FindEventListUseCase,
  FindEventDetailUseCase,
  FindActiveEventUseCase,
  FindCalendarMarkedDatesUseCase,
  FindCalendarEventListUseCase,
  FindEventResultUseCase,
  CreateEventUseCase,
  JoinEventUseCase,
  DepartEventUseCase,
  ArriveEventUseCase,
  WithdrawEventUseCase,
  UpdateEventUseCase,
  DeleteEventUseCase,
} from '../../application/usecases';
import { User, UserAuth } from 'src/module/auth/decorators';
import {
  EventListResponseDto,
  EventDetailResponseDto,
  ActiveEventResponseDto,
  CalendarMarkedDatesResponseDto,
  CalendarEventListResponseDto,
  EventResultResponseDto,
  CreateEventRequestDto,
  ArriveEventRequestDto,
  UpdateEventRequestDto,
  GetCalendarMarkedDatesRequestDto,
  GetCalendarEventListParamDto,
} from '../dtos';
import { UserInfo } from 'src/module/auth/interfaces';
import { EventTransformer } from '../transformers';

@ApiTags('사용자 - Event 관리')
@Controller({ version: '1' })
export class UserEventController {
  constructor(
    private readonly findEventListUseCase: FindEventListUseCase,
    private readonly findEventDetailUseCase: FindEventDetailUseCase,
    private readonly findActiveEventUseCase: FindActiveEventUseCase,
    private readonly findCalendarMarkedDatesUseCase: FindCalendarMarkedDatesUseCase,
    private readonly findCalendarEventListUseCase: FindCalendarEventListUseCase,
    private readonly findEventResultUseCase: FindEventResultUseCase,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly joinEventUseCase: JoinEventUseCase,
    private readonly departEventUseCase: DepartEventUseCase,
    private readonly arriveEventUseCase: ArriveEventUseCase,
    private readonly withdrawEventUseCase: WithdrawEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) {}

  @ApiOperation({
    summary: '사용자 - 캘린더 마커 날짜 조회',
    description:
      '사용자가 소속된 모임의 일정이 있는 날짜 목록을 조회합니다.<br><br>' +
      '**목적**<br>' +
      '캘린더 UI에서 일정이 있는 날짜에 마커를 표시하기 위한 API입니다.<br><br>' +
      '**조회 조건**<br>' +
      '- 사용자가 소속된 모임의 모든 일정<br>' +
      '- 모집중(RECRUITING) 또는 진행중(IN_PROGRESS) 상태인 일정<br><br>' +
      '**응답 구조**<br>' +
      '- dates: 일정이 있는 날짜 배열 (YYYY-MM-DD 형식)<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- year는 4자리 연도, month는 1~12 범위입니다.<br>',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패)<br>' +
      '**연도**<br>' +
      '- 정수가 아닌 경우<br>' +
      '- 2020 미만인 경우<br>' +
      '- 2100 초과인 경우<br>' +
      '<br>' +
      '**월**<br>' +
      '- 정수가 아닌 경우<br>' +
      '- 1 미만인 경우<br>' +
      '- 12 초과인 경우',
  })
  @ApiOkResponse({
    description: '캘린더 마커 날짜 조회 성공',
    type: CalendarMarkedDatesResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get('users/me/calendar/events')
  async getCalendarMarkedDates(
    @Query() query: GetCalendarMarkedDatesRequestDto,
    @User() user: UserInfo,
  ): Promise<CalendarMarkedDatesResponseDto> {
    const dates = await this.findCalendarMarkedDatesUseCase.execute({
      userId: user.userId,
      year: query.year,
      month: query.month,
    });

    return { dates };
  }

  @ApiOperation({
    summary: '사용자 - 날짜별 소속 모임 일정 목록 조회',
    description:
      '특정 날짜의 사용자 소속 모임 일정 목록을 조회합니다.<br><br>' +
      '**목적**<br>' +
      '캘린더 UI에서 날짜 선택 시 해당 날짜의 일정 목록을 표시하기 위한 API입니다.<br><br>' +
      '**조회 조건**<br>' +
      '- 해당 날짜(00:00:00 ~ 23:59:59)의 일정<br>' +
      '- 사용자가 소속된 모임의 일정<br>' +
      '- 모집중(RECRUITING) 또는 진행중(IN_PROGRESS) 상태인 일정<br>' +
      '- eventTime 기준 오름차순 정렬<br><br>' +
      '**응답 구조**<br>' +
      '- items: 일정 배열<br>' +
      '  - id: 일정 고유 ID<br>' +
      '  - groupId: 모임 ID<br>' +
      '  - groupName: 모임 이름<br>' +
      '  - title: 일정 제목<br>' +
      '  - eventTime: 일정 날짜/시간<br>' +
      '  - locationAddress: 도로명 주소<br>' +
      '  - locationDetail: 상세 주소<br>' +
      '  - status: 일정 상태 (RECRUITING/IN_PROGRESS)<br>' +
      '  - isParticipant: 현재 사용자의 참여 여부<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- date는 YYYY-MM-DD 형식이어야 합니다.<br>',
  })
  @ApiParam({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD)',
    example: '2026-01-15',
    required: true,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패)<br>' +
      '- 날짜 형식이 YYYY-MM-DD가 아닌 경우',
  })
  @ApiOkResponse({
    description: '날짜별 일정 목록 조회 성공',
    type: CalendarEventListResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get('users/me/calendar/events/:date')
  async getCalendarEventList(
    @Param() param: GetCalendarEventListParamDto,
    @User() user: UserInfo,
  ): Promise<CalendarEventListResponseDto> {
    const events = await this.findCalendarEventListUseCase.execute({
      userId: user.userId,
      date: param.date,
    });

    return { items: events };
  }

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
  @Get('groups/:groupId/events')
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

  @ApiOperation({
    summary: '사용자 - 모임 진행중인 일정 조회',
    description:
      '특정 모임의 현재 진행중인 일정을 조회합니다.<br><br>' +
      '**주의사항**<br>' +
      '- 해당 모임에 참여한 사용자만 조회할 수 있습니다.<br>',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiOkResponse({
    description: '진행중인 일정 조회 성공',
    type: ActiveEventResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get('groups/:groupId/events/active')
  async getActiveEvent(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
  ): Promise<ActiveEventResponseDto> {
    const result = await this.findActiveEventUseCase.execute({
      userId: user.userId,
      groupId: groupId,
    });

    return EventTransformer.toActiveEventResponse(result);
  }

  @ApiOperation({
    summary: '사용자 - 모임 일정 생성',
    description:
      '모임에 새로운 일정을 생성합니다.<br><br>' +
      '**필수 항목**<br>' +
      '제목, 설명, 일정 시간, 위치 정보(주소, 상세주소, 위도, 경도)<br><br>' +
      '**주의사항**<br>' +
      '- 일정 시간은 현재 시간으로부터 최소 20분 이후여야 합니다.<br>' +
      '- 모임당 모집 중인 일정은 최대 3개까지 생성할 수 있습니다.<br>' +
      '- 위도는 소수점 6~8자리, -90 ~ 90 범위여야 합니다.<br>' +
      '- 경도는 소수점 6~8자리, -180 ~ 180 범위여야 합니다.<br>',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440999',
    required: true,
  })
  @ApiCreatedResponse({
    description: '일정 생성 성공',
    type: EventDetailResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 또는 도메인 규칙 위반)<br>' +
      '**제목**<br>' +
      '- 제목이 비어있는 경우: _**TITLE_REQUIRED**_<br>' +
      '- 제목이 20자를 초과하는 경우: _**TITLE_TOO_LONG**_<br>' +
      '<br>' +
      '**설명**<br>' +
      '- 설명이 비어있는 경우: _**DESCRIPTION_REQUIRED**_<br>' +
      '- 설명이 200자를 초과하는 경우: _**DESCRIPTION_TOO_LONG**_<br>' +
      '<br>' +
      '**일정 시간**<br>' +
      '- 날짜 형식이 ISO 8601 형식이 아닌 경우: _**EVENT_TIME_FORMAT_INVALID**_<br>' +
      '- 유효하지 않은 날짜인 경우: _**EVENT_TIME_INVALID**_<br>' +
      '- 현재 시간으로부터 20분 이내인 경우: _**EVENT_TIME_TOO_SOON**_<br>' +
      '<br>' +
      '**위치 - 도로명 주소**<br>' +
      '- 주소가 비어있는 경우: _**ADDRESS_REQUIRED**_<br>' +
      '<br>' +
      '**위치 - 상세 주소**<br>' +
      '- 상세 주소가 비어있는 경우: _**LOCATION_DETAIL_REQUIRED**_<br>' +
      '- 상세 주소가 50자를 초과하는 경우: _**LOCATION_DETAIL_TOO_LONG**_<br>' +
      '<br>' +
      '**위치 - 위도**<br>' +
      '- 위도 형식이 유효한 숫자가 아닌 경우 (소수점 6~8자리): _**LATITUDE_FORMAT_INVALID**_<br>' +
      '- 위도가 -90 ~ 90 범위를 벗어나는 경우: _**LATITUDE_OUT_OF_RANGE**_<br>' +
      '<br>' +
      '**위치 - 경도**<br>' +
      '- 경도 형식이 유효한 숫자가 아닌 경우 (소수점 6~8자리): _**LONGITUDE_FORMAT_INVALID**_<br>' +
      '- 경도가 -180 ~ 180 범위를 벗어나는 경우: _**LONGITUDE_OUT_OF_RANGE**_<br>' +
      '<br>' +
      '**도메인 규칙**<br>' +
      '- 모임당 모집 중인 일정이 이미 3개 이상인 경우: _**MAX_RECURRING_EVENTS_EXCEEDED**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음: _**GROUP_NOT_FOUND**_<br>' +
      '해당 groupId가 존재하지 않는 경우',
  })
  @UserAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('groups/:groupId/events')
  async createEvent(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
    @Body() dto: CreateEventRequestDto,
  ): Promise<EventDetailResponseDto> {
    const { eventId } = await this.createEventUseCase.execute({
      userId: user.userId,
      groupId: groupId,
      title: dto.title,
      description: dto.description,
      eventTime: dto.eventTime,
      address: dto.location.address,
      detail: dto.location.detail,
      latitude: dto.location.latitude,
      longitude: dto.location.longitude,
    });

    const event = await this.findEventDetailUseCase.execute({
      eventId: eventId,
    });
    return EventTransformer.toDetailResponse(event);
  }

  @ApiOperation({
    summary: '사용자 - 모임 일정 상세 조회',
    description:
      '특정 일정의 상세 정보를 조회합니다.<br><br>' +
      '**목적**<br>' +
      '일정의 전체 정보(생성자, 제목, 설명, 일시, 위치, 참여자 목록)를 조회하여 일정 상세 페이지를 지원합니다.<br><br>' +
      '**응답 구조**<br>' +
      '- id: 일정 고유 ID<br>' +
      '- groupId: 모임 ID<br>' +
      '- createdBy: 생성자 정보 (userId, nickname, nameTag, preferredThemeColor, characterCode)<br>' +
      '- title: 일정 제목<br>' +
      '- description: 일정 설명<br>' +
      '- eventTime: 일정 날짜/시간<br>' +
      '- trackingStartTime: 추적 시작 시간<br>' +
      '- endTime: 종료 시간<br>' +
      '- locationAddress: 도로명 주소<br>' +
      '- locationDetail: 상세 주소<br>' +
      '- locationLatitude: 위도<br>' +
      '- locationLongitude: 경도<br>' +
      '- status: 일정 상태 (RECRUITING/IN_PROGRESS/ENDED)<br>' +
      '- participants: 참여자 목록 배열 (userId, nickname, nameTag, preferredThemeColor, characterCode)<br>' +
      '- createdAt: 생성일<br>' +
      '- updatedAt: 수정일<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- eventId는 UUID 형식이어야 합니다.<br>' +
      '- 해당 일정이 속한 모임의 참여자만 상세 정보를 조회할 수 있습니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiOkResponse({
    description: '일정 상세 조회 성공',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음<br>' +
      '- 해당 eventId가 존재하지 않거나 사용자가 속한 모임의 일정이 아닌 경우: _**EVENT_NOT_FOUND**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get('events/:eventId')
  async getEventDetail(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
  ): Promise<EventDetailResponseDto> {
    const event = await this.findEventDetailUseCase.execute({
      userId: user.userId,
      eventId: eventId,
    });

    return EventTransformer.toDetailResponse(event);
  }

  @ApiOperation({
    summary: '사용자 - 일정 결과 조회',
    description:
      '종료된 일정의 출석 결과를 조회합니다.<br><br>' +
      '**목적**<br>' +
      '일정 종료 후 참여자들의 출석 결과(도착/지각/부재)를 확인하기 위한 API입니다.<br><br>' +
      '**조회 조건**<br>' +
      '- 종료된(ENDED) 상태의 일정만 조회 가능<br>' +
      '- 사용자가 소속된 모임의 일정만 조회 가능<br><br>' +
      '**응답 구조**<br>' +
      '- eventId: 일정 ID<br>' +
      '- groupId: 모임 ID<br>' +
      '- title: 일정 제목<br>' +
      '- eventTime: 일정 시간<br>' +
      '- locationAddress: 도로명 주소<br>' +
      '- locationDetail: 상세 주소<br>' +
      '- results: 출석 결과 목록<br>' +
      '  - userId, nickname, nameTag, characterCode, preferredThemeColor<br>' +
      '  - result: ARRIVED(도착) / LATE(지각) / ABSENT(부재)<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- eventId는 UUID 형식이어야 합니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiOkResponse({
    description: '일정 결과 조회 성공',
    type: EventResultResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음<br>' +
      '- 일정이 존재하지 않거나, 종료되지 않았거나, 사용자가 속한 모임의 일정이 아닌 경우: _**EVENT_RESULT_NOT_FOUND**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get('events/:eventId/result')
  async getEventResult(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
  ): Promise<EventResultResponseDto> {
    return this.findEventResultUseCase.execute({
      userId: user.userId,
      eventId: eventId,
    });
  }

  @ApiOperation({
    summary: '사용자 - 일정 수정',
    description:
      '모집중인 일정을 수정합니다. (부분 수정 지원)<br><br>' +
      '**검증 순서**<br>' +
      '1. 일정 존재 여부 확인<br>' +
      '2. 일정 상태 확인 (RECRUITING 상태만 가능)<br>' +
      '3. 참여자 체크 완료 여부 확인<br>' +
      '4. 생성자 확인<br><br>' +
      '**수정 가능 항목**<br>' +
      '- 제목, 설명, 일정 시간, 위치 정보<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- eventId는 UUID 형식이어야 합니다.<br>' +
      '- 모집중(RECRUITING) 상태이고 참여자 체크가 완료되지 않은 일정만 수정할 수 있습니다.<br>' +
      '- 일정 생성자만 수정할 수 있습니다.<br>' +
      '- **일정 시간 변경 시 생성자를 제외한 모든 참여자가 자동으로 제거됩니다.**<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiOkResponse({
    description: '일정 수정 성공',
    type: EventDetailResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 또는 도메인 규칙 위반)<br>' +
      '**제목**<br>' +
      '- 제목이 20자를 초과하는 경우: _**TITLE_TOO_LONG**_<br>' +
      '<br>' +
      '**설명**<br>' +
      '- 설명이 200자를 초과하는 경우: _**DESCRIPTION_TOO_LONG**_<br>' +
      '<br>' +
      '**일정 시간**<br>' +
      '- 날짜 형식이 ISO 8601 형식이 아닌 경우: _**EVENT_TIME_FORMAT_INVALID**_<br>' +
      '- 유효하지 않은 날짜인 경우: _**EVENT_TIME_INVALID**_<br>' +
      '- 현재 시간으로부터 20분 이내인 경우: _**EVENT_TIME_TOO_SOON**_<br>' +
      '<br>' +
      '**위치**<br>' +
      '- 위도가 -90 ~ 90 범위를 벗어나는 경우: _**LATITUDE_OUT_OF_RANGE**_<br>' +
      '- 경도가 -180 ~ 180 범위를 벗어나는 경우: _**LONGITUDE_OUT_OF_RANGE**_<br>' +
      '<br>' +
      '**도메인 규칙**<br>' +
      '- 일정 상태가 모집중이 아니거나 참여자 체크가 완료된 경우: _**EVENT_CANNOT_BE_UPDATED**_<br>' +
      '- 일정 생성자가 아닌 경우: _**NOT_EVENT_CREATOR**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음: _**EVENT_NOT_FOUND**_<br>' +
      '해당 eventId가 존재하지 않는 경우',
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Patch('events/:eventId')
  async updateEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
    @Body() dto: UpdateEventRequestDto,
  ): Promise<EventDetailResponseDto> {
    await this.updateEventUseCase.execute({
      eventId: eventId,
      userId: user.userId,
      title: dto.title,
      description: dto.description,
      eventTime: dto.eventTime,
    });

    const event = await this.findEventDetailUseCase.execute({
      userId: user.userId,
      eventId: eventId,
    });

    return EventTransformer.toDetailResponse(event);
  }

  @ApiOperation({
    summary: '사용자 - 일정 삭제',
    description:
      '모집중인 일정을 삭제합니다.<br><br>' +
      '**검증 순서**<br>' +
      '1. 일정 존재 여부 확인<br>' +
      '2. 일정 상태 확인 (RECRUITING 상태만 가능)<br>' +
      '3. 참여자 체크 완료 여부 확인<br>' +
      '4. 생성자 확인<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- eventId는 UUID 형식이어야 합니다.<br>' +
      '- 모집중(RECRUITING) 상태이고 참여자 체크가 완료되지 않은 일정만 삭제할 수 있습니다.<br>' +
      '- 일정 생성자만 삭제할 수 있습니다.<br>' +
      '- 삭제 시 참여자, 결과 데이터가 모두 함께 삭제됩니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiNoContentResponse({
    description: '일정 삭제 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (도메인 규칙 위반)<br>' +
      '- 일정 상태가 모집중이 아니거나 참여자 체크가 완료된 경우: _**EVENT_CANNOT_BE_DELETED**_<br>' +
      '- 일정 생성자가 아닌 경우: _**NOT_EVENT_CREATOR**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음: _**EVENT_NOT_FOUND**_<br>' +
      '해당 eventId가 존재하지 않는 경우',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('events/:eventId')
  async deleteEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.deleteEventUseCase.execute({
      eventId: eventId,
      userId: user.userId,
    });
  }

  @ApiOperation({
    summary: '사용자 - 일정 참여',
    description:
      '모집중인 일정에 참여합니다.<br><br>' +
      '**검증 순서**<br>' +
      '1. 일정 존재 여부 확인<br>' +
      '2. 일정 상태 확인 (RECRUITING 상태만 가능)<br>' +
      '3. 참여자 체크 완료 여부 확인<br>' +
      '4. 중복 참여 확인<br>' +
      '5. 다른 일정과의 시간 충돌 확인 (tracking_start_time ~ end_time)<br><br>' +
      '**응답 구조**<br>' +
      '참여 성공 시 해당 일정의 전체 정보를 반환합니다. (생성자, 제목, 설명, 일시, 위치, 참여자 목록 포함)<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- eventId는 UUID 형식이어야 합니다.<br>' +
      '- 참여자 체크가 완료된 일정에는 참여할 수 없습니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiCreatedResponse({
    description: '일정 참여 성공',
    type: EventDetailResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (도메인 규칙 위반)<br>' +
      '- 일정 상태가 모집중이 아닌 경우: _**EVENT_NOT_RECRUITING**_<br>' +
      '- 참여자 체크가 완료된 일정인 경우: _**PARTICIPANT_CHECK_ALREADY_DONE**_<br>' +
      '- 이미 참여 중인 일정인 경우: _**ALREADY_PARTICIPATING**_<br>' +
      '- 다른 일정과 시간이 중복되는 경우: _**EVENT_TIME_CONFLICT**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음: _**EVENT_NOT_FOUND**_<br>' +
      '해당 eventId가 존재하지 않는 경우',
  })
  @UserAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('events/:eventId/participants')
  async joinEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
  ): Promise<EventDetailResponseDto> {
    await this.joinEventUseCase.execute({
      eventId: eventId,
      userId: user.userId,
    });

    const event = await this.findEventDetailUseCase.execute({
      userId: user.userId,
      eventId: eventId,
    });

    return EventTransformer.toDetailResponse(event);
  }

  @ApiOperation({
    summary: '사용자 - 일정 참여 철회',
    description:
      '모집중인 일정에서 참여를 철회합니다.<br><br>' +
      '**검증 순서**<br>' +
      '1. 일정 존재 여부 확인<br>' +
      '2. 일정 상태 확인 (RECRUITING 상태만 가능)<br>' +
      '3. 참여자 체크 완료 여부 확인<br>' +
      '4. 일정 생성자 여부 확인<br>' +
      '5. 참여자 확인<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- eventId는 UUID 형식이어야 합니다.<br>' +
      '- 모집중(RECRUITING) 상태이고 참여자 체크가 완료되지 않은 일정에서만 철회할 수 있습니다.<br>' +
      '- 진행중(IN_PROGRESS) 또는 종료된(ENDED) 일정에서는 철회할 수 없습니다.<br>' +
      '- 일정 생성자는 참여를 철회할 수 없습니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiNoContentResponse({
    description: '참여 철회 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (도메인 규칙 위반)<br>' +
      '- 일정 상태가 모집중이 아닌 경우: _**EVENT_NOT_RECRUITING**_<br>' +
      '- 참여자 체크가 완료된 일정인 경우: _**PARTICIPANT_CHECK_ALREADY_DONE**_<br>' +
      '- 일정 생성자인 경우: _**CREATOR_CANNOT_WITHDRAW**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음<br>' +
      '- 일정이 존재하지 않는 경우: _**EVENT_NOT_FOUND**_<br>' +
      '- 참여자를 찾을 수 없는 경우: _**PARTICIPANT_NOT_FOUND**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('events/:eventId/participants')
  async withdrawEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.withdrawEventUseCase.execute({
      eventId: eventId,
      userId: user.userId,
    });
  }

  @ApiOperation({
    summary: '[사용자] - 일정 출발 상태 변경',
    description:
      '진행중인 일정에서 참여자의 상태를 출발(DEPARTED)로 변경합니다.<br><br>' +
      '**주의사항**<br>' +
      '- 일정이 진행중(IN_PROGRESS) 상태여야 합니다.<br>' +
      '- 참여자의 상태가 준비중(PREPARING)이어야 출발할 수 있습니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiNoContentResponse({
    description: '출발 상태 변경 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (도메인 규칙 위반)<br>' +
      '**일정 상태**<br>' +
      '- 일정이 진행중이 아닌 경우: _**EVENT_NOT_IN_PROGRESS**_<br>' +
      '<br>' +
      '**참여자**<br>' +
      '- 참여자를 찾을 수 없는 경우: _**PARTICIPANT_NOT_FOUND**_<br>' +
      '- 참여자가 준비중 상태가 아닌 경우: _**PARTICIPANT_CANNOT_DEPART**_<br>',
  })
  @ApiNotFoundResponse({
    description: '일정을 찾을 수 없음: _**EVENT_NOT_FOUND**_',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('events/:eventId/depart')
  async departEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.departEventUseCase.execute({
      eventId: eventId,
      userId: user.userId,
    });
  }

  @ApiOperation({
    summary: '[사용자] - 일정 도착 처리',
    description:
      '진행중인 일정에서 참여자의 상태를 도착(ARRIVED)으로 변경합니다. 도착 지점으로부터 50m 이내에 있어야 도착 처리가 가능합니다.<br><br>' +
      '**필수 항목**<br>' +
      '위치 좌표 (위도, 경도)<br><br>' +
      '**주의사항**<br>' +
      '- 일정이 진행중(IN_PROGRESS) 상태여야 합니다.<br>' +
      '- 참여자의 상태가 출발(DEPARTED)이어야 도착 처리할 수 있습니다.<br>' +
      '- 도착 지점으로부터 50m 이내에 있어야 합니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: true,
  })
  @ApiNoContentResponse({
    description: '도착 처리 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 또는 도메인 규칙 위반)<br>' +
      '**위치 좌표**<br>' +
      '- 위도 형식이 유효하지 않은 경우 (소수점 6~8자리): _**LATITUDE_FORMAT_INVALID**_<br>' +
      '- 위도가 범위를 벗어난 경우 (-90 ~ 90): _**LATITUDE_OUT_OF_RANGE**_<br>' +
      '- 경도 형식이 유효하지 않은 경우 (소수점 6~8자리): _**LONGITUDE_FORMAT_INVALID**_<br>' +
      '- 경도가 범위를 벗어난 경우 (-180 ~ 180): _**LONGITUDE_OUT_OF_RANGE**_<br>' +
      '<br>' +
      '**일정 상태**<br>' +
      '- 일정이 진행중이 아닌 경우: _**EVENT_NOT_IN_PROGRESS**_<br>' +
      '<br>' +
      '**위치 검증**<br>' +
      '- 도착 지점으로부터 50m 이상 떨어진 경우: _**ARRIVAL_LOCATION_TOO_FAR**_<br>' +
      '<br>' +
      '**참여자**<br>' +
      '- 참여자를 찾을 수 없는 경우: _**PARTICIPANT_NOT_FOUND**_<br>' +
      '- 참여자가 출발 상태가 아닌 경우: _**PARTICIPANT_CANNOT_ARRIVE**_<br>',
  })
  @ApiNotFoundResponse({
    description: '일정을 찾을 수 없음: _**EVENT_NOT_FOUND**_',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('events/:eventId/arrive')
  async arriveEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @User() user: UserInfo,
    @Body() dto: ArriveEventRequestDto,
  ): Promise<void> {
    await this.arriveEventUseCase.execute({
      eventId: eventId,
      userId: user.userId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }
}
