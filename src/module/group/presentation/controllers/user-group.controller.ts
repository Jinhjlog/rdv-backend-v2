import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserAuth, User } from '../../../auth/decorators';
import { UserInfo } from '../../../auth/interfaces';
import {
  CreateGroupUseCase,
  FindGroupListUseCase,
  FindGroupDetailUseCase,
} from '../../application/usecases';
import {
  CreateGroupRequestDto,
  GroupListResponseDto,
  GroupDetailResponseDto,
} from '../dtos';
import { GroupTransformer } from '../transformers';

@ApiTags('사용자 - 모임')
@Controller({ path: 'groups', version: '1' })
export class UserGroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly findGroupListUseCase: FindGroupListUseCase,
    private readonly findGroupDetailUseCase: FindGroupDetailUseCase,
  ) {}

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
    await this.createGroupUseCase.execute({
      userId: user.userId,
      name: dto.name,
      description: dto.description,
      iconCode: dto.iconCode,
    });

    throw new NotImplementedException();
  }

  @ApiOperation({
    summary: '[사용자] - 내가 참여 중인 모임 목록 조회',
    description:
      '로그인한 사용자가 속한 모든 모임의 목록을 조회합니다.<br><br>' +
      '**반환 정보**<br>' +
      '- 사용자가 모임장 또는 멤버로 참여 중인 모든 모임<br>' +
      '- 각 모임의 기본 정보 (이름, 소개, 아이콘, 멤버 수)<br><br>' +
      '**주의사항**<br>' +
      '- 결과는 모임별로 그룹화되어 반환됩니다.<br>' +
      '- 사용자가 속한 모임이 없으면 빈 배열이 반환됩니다.',
  })
  @ApiOkResponse({
    description: '모임 목록 조회 성공',
    type: GroupListResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get()
  async findGroupList(@User() user: UserInfo): Promise<GroupListResponseDto> {
    const groups = await this.findGroupListUseCase.execute({
      userId: user.userId,
    });

    return GroupTransformer.toListResponse(groups);
  }

  @ApiOperation({
    summary: '[사용자] - 모임 상세 조회',
    description:
      '특정 모임의 상세 정보와 멤버 목록을 조회합니다.<br><br>' +
      '**반환 정보**<br>' +
      '- 모임의 기본 정보 (이름, 소개, 아이콘, 모임장)<br>' +
      '- 모임에 속한 모든 멤버의 정보 및 역할<br><br>' +
      '**주의사항**<br>' +
      '- 모임에 속하지 않은 사용자도 조회 가능합니다.<br>' +
      '- 존재하지 않는 모임 ID의 경우 404 에러가 반환됩니다.',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: '모임 상세 조회 성공',
    type: GroupDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get(':groupId')
  async findGroupDetail(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
  ): Promise<GroupDetailResponseDto> {
    const group = await this.findGroupDetailUseCase.execute({
      groupId,
      userId: user.userId,
    });

    return GroupTransformer.toDetailResponse(group);
  }
}
