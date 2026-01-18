import {
  Body,
  Controller,
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
} from '@nestjs/swagger';
import { User, UserAuth } from 'src/module/auth/decorators';
import { UserInfo } from 'src/module/auth/interfaces';
import { UpdateLocationUseCase } from '../../application/usecases';
import { UpdateLocationRequestDto } from '../dtos/request';

@ApiTags('사용자 - 위치 추적 관리')
@Controller()
export class LocationTrackingController {
  constructor(private readonly updateLocationUseCase: UpdateLocationUseCase) {}

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
}
