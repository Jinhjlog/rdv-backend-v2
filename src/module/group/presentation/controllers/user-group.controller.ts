import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserAuth, User } from '../../../auth/decorators';
import { UserInfo } from '../../../auth/interfaces';
import { CreateGroupUseCase } from '../../application/usecases';
import { CreateGroupRequestDto, GroupDetailResponseDto } from '../dtos';

@ApiTags('사용자 - 모임')
@Controller({ path: 'groups', version: '1' })
export class UserGroupController {
  constructor(private readonly createGroupUseCase: CreateGroupUseCase) {}

  @ApiOperation({
    summary: '모임 생성',
    description:
      '새로운 모임을 생성합니다. 모임장으로서 기본 정보를 설정하여 모임을 생성합니다.<br><br>' +
      '**필수 항목**<br>' +
      '- name: 모임 이름<br>' +
      '- description: 모임 소개<br>' +
      '- iconCode: 모임 아이콘 코드<br><br>' +
      '**선택 항목**<br>' +
      '없음<br><br>' +
      '**주의사항**<br>' +
      '- 사용자당 1개의 모임만 모임장으로 운영 가능합니다.<br>' +
      '- 생성 시 최대 인원은 8명으로 설정됩니다.<br>' +
      '- 생성 시 공개 여부는 비공개(false)로 설정됩니다.',
  })
  @ApiCreatedResponse({
    description: '모임 생성 성공',
    type: GroupDetailResponseDto,
  })
  @ApiConflictResponse({
    description:
      '이미 모임장으로 참여 중인 모임이 있습니다: _**GROUP_NOT_ALLOWED_MULTIPLE_OWNERSHIP**_',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**모임 이름**<br>' +
      '- 모임 이름이 너무 짧거나 긴 경우 (1~20자): _**NAME_TOO_SHORT**_, _**NAME_TOO_LONG**_<br>' +
      '<br>' +
      '**모임 소개**<br>' +
      '- 모임 소개가 너무 짧거나 긴 경우 (1~200자): _**DESCRIPTION_TOO_SHORT**_, _**DESCRIPTION_TOO_LONG**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createGroup(
    @Body() dto: CreateGroupRequestDto,
    @User() user: UserInfo,
  ): Promise<GroupDetailResponseDto> {
    const { groupId } = await this.createGroupUseCase.execute({
      userId: user.userId,
      name: dto.name,
      description: dto.description,
      iconCode: dto.iconCode,
    });

    throw new NotImplementedException();
  }
}
