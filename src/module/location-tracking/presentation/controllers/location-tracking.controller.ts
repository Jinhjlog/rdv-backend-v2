import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { User, UserAuth } from 'src/module/auth/decorators';
import { UserInfo } from 'src/module/auth/interfaces';
import {
  FindLocationsByEventUseCase,
  UpdateLocationUseCase,
} from '../../application/usecases';
import { UpdateLocationRequestDto } from '../dtos/request';
import { LocationListResponseDto } from '../dtos/response';

@ApiTags('사용자 - 위치 추적 관리')
@Controller()
export class LocationTrackingController {
  constructor(
    private readonly findLocationsByEventUseCase: FindLocationsByEventUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
  ) {}

  @ApiOperation({
    summary: '사용자 - 위치 갱신',
    description:
      '진행중인 일정에서 사용자의 현재 위치를 갱신합니다.<br><br>' +
      '**필수 항목**<br>' +
      '위도, 경도<br><br>' +
      '**주의사항**<br>' +
      '- 위도와 경도는 소수점 6~8자리 형식이어야 합니다.<br>' +
      '- 위도는 -90 ~ 90 범위, 경도는 -180 ~ 180 범위여야 합니다.<br>' +
      '- 진행중인 일정이 없으면 오류가 발생합니다.<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({
    description: '위치 갱신 성공',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**위도**<br>' +
      '- 위도가 유효한 문자열 숫자가 아닌 경우 (소수점 6~8자리): _**LATITUDE_FORMAT_INVALID**_<br>' +
      '- 위도가 -90 ~ 90 범위를 벗어난 경우: _**LATITUDE_OUT_OF_RANGE**_<br>' +
      '<br>' +
      '**경도**<br>' +
      '- 경도가 유효한 문자열 숫자가 아닌 경우 (소수점 6~8자리): _**LONGITUDE_FORMAT_INVALID**_<br>' +
      '- 경도가 -180 ~ 180 범위를 벗어난 경우: _**LONGITUDE_OUT_OF_RANGE**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '진행중인 위치 추적 데이터를 찾을 수 없음: _**LOCATION_TRACKING_NOT_FOUND**_',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('events/:eventId/location-trackings')
  async updateLocation(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: UpdateLocationRequestDto,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.updateLocationUseCase.execute({
      userId: user.userId,
      eventId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }

  @ApiOperation({
    summary: '[사용자] - 일정별 참여자 위치 목록 조회',
    description:
      '진행 중인 일정에 참여한 사용자들의 실시간 위치 정보를 조회합니다.<br><br>' +
      '**필수 항목**<br>' +
      '일정 ID (Path Parameter)<br><br>' +
      '**선택 항목**<br>' +
      '없음<br><br>' +
      '**응답 정보**<br>' +
      '- 각 참여자의 사용자 ID, 닉네임, 네임태그, 캐릭터 코드가 포함됩니다<br>' +
      '- 위도/경도는 위치 정보가 있는 경우에만 제공됩니다 (nullable)<br>' +
      '- 위치 업데이트 시간 기준 최신순으로 정렬됩니다<br><br>' +
      '**주의사항**<br>' +
      '- 일정 ID는 유효한 UUID 형식이어야 합니다<br>',
  })
  @ApiParam({
    name: 'eventId',
    description: '일정 ID (UUID 형식)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: '위치 목록 조회 성공',
    type: LocationListResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**eventId**<br>' +
      '- UUID 형식이 아닌 경우: _**INVALID_UUID_FORMAT**_<br>',
  })
  @UserAuth()
  @Get('events/:eventId/location-trackings')
  async findLocationsByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<LocationListResponseDto> {
    const locations = await this.findLocationsByEventUseCase.execute({
      eventId,
    });

    return {
      items: locations.map((location) => ({
        userId: location.userId,
        nickname: location.nickname,
        nameTag: location.nameTag,
        characterCode: location.characterCode,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        lastUpdatedAt: location.lastUpdatedAt ?? null,
      })),
    };
  }
}
