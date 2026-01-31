import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
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
  UpdateGroupUseCase,
  DeleteGroupUseCase,
  CreateInviteCodeUseCase,
  JoinGroupUseCase,
  RemoveMemberUseCase,
  LeaveGroupUseCase,
  TransferOwnershipUseCase,
  GetGroupMemberAttendanceStatisticsUseCase,
} from '../../application/usecases';
import {
  CreateGroupRequestDto,
  UpdateGroupRequestDto,
  JoinGroupRequestDto,
  TransferOwnershipRequestDto,
  GroupListResponseDto,
  GroupDetailResponseDto,
  CreateInviteCodeResponseDto,
  GroupMemberAttendanceStatisticsResponseDto,
} from '../dtos';
import { GroupTransformer } from '../transformers';

@ApiTags('사용자 - 모임')
@Controller({ path: 'groups', version: '1' })
export class UserGroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly findGroupListUseCase: FindGroupListUseCase,
    private readonly findGroupDetailUseCase: FindGroupDetailUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly deleteGroupUseCase: DeleteGroupUseCase,
    private readonly createInviteCodeUseCase: CreateInviteCodeUseCase,
    private readonly joinGroupUseCase: JoinGroupUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly leaveGroupUseCase: LeaveGroupUseCase,
    private readonly transferOwnershipUseCase: TransferOwnershipUseCase,
    private readonly getGroupMemberAttendanceStatisticsUseCase: GetGroupMemberAttendanceStatisticsUseCase,
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
    const { groupId } = await this.createGroupUseCase.execute({
      userId: user.userId,
      name: dto.name,
      description: dto.description,
      iconCode: dto.iconCode,
    });

    const group = await this.findGroupDetailUseCase.execute({
      groupId,
      userId: user.userId,
    });
    return GroupTransformer.toDetailResponse(group);
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

  @ApiOperation({
    summary: '[모임장] - 모임 정보 수정',
    description:
      '모임의 기본 정보를 수정합니다. 모임장만 수정 가능합니다.<br><br>' +
      '**필수 항목**<br>' +
      '없음 (모든 필드 선택 수정)<br><br>' +
      '**선택 항목**<br>' +
      '- name: 모임 이름<br>' +
      '- description: 모임 소개<br>' +
      '- iconCode: 모임 아이콘 코드<br><br>' +
      '**주의사항**<br>' +
      '- 모임장만 수정 가능합니다.<br>' +
      '- 요청 본문에 포함된 필드만 업데이트됩니다.<br>' +
      '- 최소 1개 이상의 필드를 제공해야 합니다.',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: '모임 정보 수정 성공',
    type: GroupDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '모임장만 수정 가능합니다: _**GROUP_OWNER_ONLY**_<br>' +
      '**모임 이름**<br>' +
      '- 모임 이름이 너무 짧거나 긴 경우 (2~30자): _**NAME_TOO_SHORT**_, _**NAME_TOO_LONG**_<br>' +
      '<br>' +
      '**모임 소개**<br>' +
      '- 모임 소개가 너무 짧거나 긴 경우 (10~500자): _**DESCRIPTION_TOO_SHORT**_, _**DESCRIPTION_TOO_LONG**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Patch(':groupId')
  async updateGroup(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: UpdateGroupRequestDto,
    @User() user: UserInfo,
  ): Promise<GroupDetailResponseDto> {
    await this.updateGroupUseCase.execute({
      groupId,
      userId: user.userId,
      ...dto,
    });

    const group = await this.findGroupDetailUseCase.execute({
      groupId,
      userId: user.userId,
    });
    return GroupTransformer.toDetailResponse(group);
  }

  @ApiOperation({
    summary: '[모임장] - 모임 삭제',
    description:
      '모임을 삭제합니다. 모임장만 삭제 가능하며, 모임장이 유일한 참여자여야 합니다.<br><br>' +
      '**삭제 조건**<br>' +
      '- 모임장 권한이 필요합니다.<br>' +
      '- 모임장 혼자만 남아있어야 합니다 (다른 멤버가 없어야 함).<br><br>' +
      '**주의사항**<br>' +
      '- 삭제된 모임은 복구할 수 없습니다.<br>' +
      '- 모임 삭제 후 모든 관련 데이터는 영구 삭제됩니다.',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({
    description: '모임 삭제 성공',
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '요청 충돌<br>' +
      '**권한 오류**<br>' +
      '- 모임장만 삭제 가능합니다: _**GROUP_OWNER_ONLY**_<br>' +
      '<br>' +
      '**비즈니스 규칙 위반**<br>' +
      '- 다른 참여자가 있는 모임은 삭제할 수 없습니다 (모임장만 남아있어야 함): _**GROUP_HAS_OTHER_MEMBERS**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId')
  async deleteGroup(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.deleteGroupUseCase.execute({
      groupId,
      userId: user.userId,
    });
  }

  @ApiOperation({
    summary: '[비참여자] - 초대 코드로 모임 참여',
    description:
      '초대 코드를 사용하여 모임에 참여합니다. 초대 코드는 모임 참여자가 생성한 유효한 코드여야 합니다.<br><br>' +
      '**필수 항목**<br>' +
      '- inviteCode: 초대 코드<br><br>' +
      '**참여 조건**<br>' +
      '- 초대 코드가 유효하고 만료되지 않아야 합니다.<br>' +
      '- 모임의 최대 인원에 도달하지 않아야 합니다.<br><br>' +
      '**반환 정보**<br>' +
      '- 참여 후 모임의 상세 정보와 멤버 목록',
  })
  @ApiCreatedResponse({
    description: '모임 참여 성공',
    type: GroupDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음<br>' +
      '**초대 코드**<br>' +
      '- 초대 코드가 존재하지 않습니다: _**INVITE_CODE_NOT_FOUND**_<br>' +
      '<br>' +
      '**모임**<br>' +
      '- 모임을 찾을 수 없습니다: _**GROUP_NOT_FOUND**_<br>',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 또는 비즈니스 규칙 위반)<br>' +
      '**필드 검증 오류**<br>' +
      '- 초대 코드는 필수 입력값입니다<br>' +
      '- 초대 코드는 문자열이어야 합니다<br>' +
      '<br>' +
      '**초대 코드 상태**<br>' +
      '- 만료되었거나 이미 사용된 초대 코드입니다: _**INVITE_CODE_EXPIRED**_<br>' +
      '<br>' +
      '**모임 참여 조건**<br>' +
      '- 모임 인원이 가득 찼습니다 (최대 8명): _**GROUP_MEMBERS_LIMIT_EXCEEDED**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('join')
  async joinGroup(
    @Body() dto: JoinGroupRequestDto,
    @User() user: UserInfo,
  ): Promise<GroupDetailResponseDto> {
    const { groupId } = await this.joinGroupUseCase.execute({
      inviteCode: dto.inviteCode,
      userId: user.userId,
    });

    const group = await this.findGroupDetailUseCase.execute({
      groupId,
      userId: user.userId,
    });
    return GroupTransformer.toDetailResponse(group);
  }

  @ApiOperation({
    summary: '[모임 멤버] - 초대 코드 생성',
    description:
      '모임 참여자가 다른 사람을 초대하기 위한 초대 코드를 생성합니다. 모임장 또는 일반 멤버만 생성 가능합니다.<br><br>' +
      '**반환 정보**<br>' +
      '- code: 초대 코드 (다른 사용자가 모임 참여 시 사용)<br>' +
      '- expiresAt: 초대 코드 만료 시간<br><br>' +
      '**주의사항**<br>' +
      '- 모임 참여자만 초대 코드를 생성할 수 있습니다.<br>' +
      '- 초대 코드는 만료 시간 이내에만 사용 가능합니다.<br>' +
      '- 초대 코드는 중복되지 않도록 자동으로 생성됩니다.',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiCreatedResponse({
    description: '초대 코드 생성 성공',
    type: CreateInviteCodeResponseDto,
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '모임 참여자만 초대 코드를 생성할 수 있습니다: _**GROUP_MEMBER_ONLY**_',
  })
  @UserAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post(':groupId/invite-codes')
  async createInviteCode(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
  ): Promise<CreateInviteCodeResponseDto> {
    const result = await this.createInviteCodeUseCase.execute({
      groupId,
      userId: user.userId,
    });

    return {
      code: result.code,
      expiresAt: result.expiresAt,
    };
  }

  @ApiOperation({
    summary: '[모임장] - 참여자 강퇴',
    description:
      '모임에서 특정 참여자를 강퇴합니다. 모임장만 강퇴할 수 있습니다.<br><br>' +
      '**강퇴 조건**<br>' +
      '- 모임장 권한이 필요합니다.<br>' +
      '- 강퇴하려는 대상이 모임에 속해있어야 합니다.<br>' +
      '- 모임장 본인은 강퇴할 수 없습니다.<br><br>' +
      '**주의사항**<br>' +
      '- 강퇴된 참여자는 즉시 모임에서 제외됩니다.<br>' +
      '- 강퇴 후 해당 참여자는 초대 코드를 통해 다시 참여할 수 있습니다.',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'userId',
    description: '강퇴할 참여자의 사용자 ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiNoContentResponse({
    description: '참여자 강퇴 성공',
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (권한 오류 또는 비즈니스 규칙 위반)<br>' +
      '**권한 오류**<br>' +
      '- 모임장만 참여자를 강퇴할 수 있습니다: _**GROUP_OWNER_ONLY**_<br>' +
      '<br>' +
      '**비즈니스 규칙 위반**<br>' +
      '- 모임장은 강퇴할 수 없습니다: _**GROUP_OWNER_CANNOT_BE_REMOVED**_<br>' +
      '- 강퇴하려는 멤버가 모임에 존재하지 않습니다: _**GROUP_MEMBER_NOT_FOUND**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId/members/:userId')
  async removeMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.removeMemberUseCase.execute({
      groupId,
      userId: user.userId,
      targetUserId,
    });
  }

  @ApiOperation({
    summary: '[일반 참여자] - 모임 탈퇴',
    description:
      '모임에서 탈퇴합니다. 일반 참여자만 탈퇴할 수 있습니다.<br><br>' +
      '**탈퇴 조건**<br>' +
      '- 일반 참여자(MEMBER)만 탈퇴 가능합니다.<br>' +
      '- 모임장은 탈퇴할 수 없습니다.<br>' +
      '- 진행중인 일정에 참여 중이면 탈퇴할 수 없습니다.<br>' +
      '- 참여자 체크 시간(일정 시간 -20분) 이내의 모집중 일정에 참여 중이면 탈퇴할 수 없습니다.<br>' +
      '- 본인이 생성한 활성 일정(모집중/진행중)이 있으면 탈퇴할 수 없습니다.<br><br>' +
      '**자동 처리**<br>' +
      '- 참여자 체크 시간 이전의 모집중 일정(생성자가 아닌 경우)은 자동으로 참여 철회됩니다.<br><br>' +
      '**주의사항**<br>' +
      '- 탈퇴 후에는 즉시 모임에서 제외됩니다.<br>' +
      '- 탈퇴 후 복구는 불가능합니다.',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({
    description: '모임 탈퇴 성공',
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (비즈니스 규칙 위반)<br>' +
      '**탈퇴 권한**<br>' +
      '- 모임장은 탈퇴할 수 없습니다: _**GROUP_OWNER_CANNOT_LEAVE**_<br>' +
      '<br>' +
      '**멤버 확인**<br>' +
      '- 멤버를 찾을 수 없습니다: _**GROUP_MEMBER_NOT_FOUND**_<br>' +
      '<br>' +
      '**일정 관련 제약**<br>' +
      '- 진행중인 일정에 참여 중입니다: _**CANNOT_LEAVE_DURING_EVENT_IN_PROGRESS**_<br>' +
      '- 참여자 체크 시간이 임박한 일정이 있습니다: _**CANNOT_LEAVE_NEAR_PARTICIPANT_CHECK**_<br>' +
      '- 본인이 생성한 활성 일정이 있습니다: _**CANNOT_LEAVE_WITH_ACTIVE_EVENTS_CREATED**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':groupId/leave')
  async leaveGroup(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
  ): Promise<void> {
    await this.leaveGroupUseCase.execute({
      groupId,
      userId: user.userId,
    });
  }

  @ApiOperation({
    summary: '[모임장] - 모임장 이전',
    description:
      '모임장 권한을 다른 참여자에게 이전합니다. 현재 모임장만 이전할 수 있습니다.<br><br>' +
      '**이전 조건**<br>' +
      '- 현재 모임장 권한이 필요합니다.<br>' +
      '- 새로운 모임장이 될 사용자가 모임의 참여자여야 합니다.<br><br>' +
      '**주의사항**<br>' +
      '- 모임장 이전 후 즉시 권한이 이전됩니다.<br>' +
      '- 이전 후 기존 모임장은 일반 참여자로 변경됩니다.<br>' +
      '- 되돌릴 수 없으므로 신중하게 진행해주세요.',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiCreatedResponse({
    description: '모임장 이전 성공',
    type: GroupDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (권한 오류 또는 비즈니스 규칙 위반)<br>' +
      '**권한 오류**<br>' +
      '- 모임장만 모임장 권한을 이전할 수 있습니다: _**GROUP_OWNER_ONLY**_<br>' +
      '<br>' +
      '**비즈니스 규칙 위반**<br>' +
      '- 본인에게 모임장 권한을 이전할 수 없습니다: _**GROUP_OWNER_CANNOT_TRANSFER_TO_SELF**_<br>' +
      '- 새로운 모임장이 될 멤버가 모임에 존재하지 않습니다: _**GROUP_MEMBER_NOT_FOUND**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post(':groupId/transfer-ownership')
  async transferOwnership(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() dto: TransferOwnershipRequestDto,
    @User() user: UserInfo,
  ): Promise<GroupDetailResponseDto> {
    await this.transferOwnershipUseCase.execute({
      groupId,
      userId: user.userId,
      newOwnerId: dto.newOwnerId,
    });

    const group = await this.findGroupDetailUseCase.execute({
      groupId,
      userId: user.userId,
    });
    return GroupTransformer.toDetailResponse(group);
  }

  @ApiOperation({
    summary: '[모임 멤버] - 모임 참여자 출석 통계 조회',
    description:
      '모임에 속한 모든 멤버들의 출석 통계를 조회합니다.<br><br>' +
      '**목적**<br>' +
      '모임 내 멤버들의 일정 참여 기록을 바탕으로 출석률을 계산하여 제공합니다.<br><br>' +
      '**동작**<br>' +
      '- 모임의 모든 일정에서 발생한 출석 결과(도착/지각/부재) 집계<br>' +
      '- 출석률 계산: (도착 횟수 / 전체 참여 횟수) × 100%<br><br>' +
      '**반환 정보**<br>' +
      '- 멤버별 도착/지각/부재 횟수<br>' +
      '- 멤버별 전체 참여 횟수<br>' +
      '- 멤버별 출석률 (소수점 2자리까지)<br>',
  })
  @ApiParam({
    name: 'groupId',
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: '모임 참여자 출석 통계 조회 성공',
    type: GroupMemberAttendanceStatisticsResponseDto,
  })
  @ApiNotFoundResponse({
    description: '모임을 찾을 수 없음: _**GROUP_NOT_FOUND**_',
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get(':groupId/attendance-statistics')
  async getGroupMemberAttendanceStatistics(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @User() user: UserInfo,
  ): Promise<GroupMemberAttendanceStatisticsResponseDto> {
    const result = await this.getGroupMemberAttendanceStatisticsUseCase.execute(
      {
        groupId,
        userId: user.userId,
      },
    );

    return {
      groupId: result.groupId,
      members: result.members.map((member) => ({
        userId: member.userId,
        nickname: member.nickname,
        arrivedCount: member.arrivedCount,
        lateCount: member.lateCount,
        absentCount: member.absentCount,
        totalCount: member.totalCount,
        attendanceRate: member.attendanceRate,
      })),
    };
  }
}
