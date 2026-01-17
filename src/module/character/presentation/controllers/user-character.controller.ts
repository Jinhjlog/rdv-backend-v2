import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UserInfo } from 'src/module/auth/interfaces';
import { CharacterListResponseDto } from '../dtos';
import {
  FindCharacterListUseCase,
  FindMyCharacterListUseCase,
} from '../../application/usecases';
import { CharacterTransformer } from '../transformers';
import { UserAuth, User } from 'src/module/auth/decorators';

@ApiTags('캐릭터 - 캐릭터 관리')
@Controller({ path: 'characters', version: '1' })
export class UserCharacterController {
  constructor(
    private readonly findCharacterListUseCase: FindCharacterListUseCase,
    private readonly findMyCharacterListUseCase: FindMyCharacterListUseCase,
  ) {}

  @ApiOperation({
    summary: '사용자 - 전체 캐릭터 목록 조회',
    description:
      '게임에서 사용 가능한 모든 캐릭터의 목록을 조회합니다.<br><br>' +
      '**목적**<br>' +
      '전체 캐릭터 목록을 표시하여 캐릭터 선택 UI를 지원합니다.<br><br>' +
      '**응답 구조**<br>' +
      '- characters: 캐릭터 배열<br>' +
      '  - id: 캐릭터 고유 ID<br>' +
      '  - characterCode: 캐릭터 구분 코드<br>' +
      '  - name: 캐릭터 이름<br>' +
      '  - description: 캐릭터 설명<br>' +
      '  - isDefault: 기본 제공 여부<br>' +
      '  - createdAt: 생성일<br>' +
      '  - updatedAt: 수정일<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- 모든 캐릭터 데이터를 반환하며 필터링이나 검색은 제공되지 않습니다.<br>',
  })
  @ApiOkResponse({
    description: '캐릭터 목록 조회 성공',
    type: CharacterListResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get()
  async findList(): Promise<CharacterListResponseDto> {
    const queryModels = await this.findCharacterListUseCase.execute();

    return CharacterTransformer.toListResponse(queryModels);
  }

  @ApiOperation({
    summary: '사용자 - 내 보유 캐릭터 목록 조회',
    description:
      '현재 로그인한 사용자가 보유한 캐릭터 목록을 조회합니다.<br><br>' +
      '**목적**<br>' +
      '사용자의 보유 캐릭터를 조회하여 캐릭터 선택 또는 캐릭터 관리 UI를 지원합니다.<br><br>' +
      '**응답 구조**<br>' +
      '- characters: 보유 캐릭터 배열 (사용자별 필터링)<br>' +
      '  - id: 캐릭터 고유 ID<br>' +
      '  - characterCode: 캐릭터 구분 코드<br>' +
      '  - name: 캐릭터 이름<br>' +
      '  - description: 캐릭터 설명<br>' +
      '  - isDefault: 기본 제공 여부<br>' +
      '  - createdAt: 생성일<br>' +
      '  - updatedAt: 수정일<br><br>' +
      '**주의사항**<br>' +
      '- 인증된 사용자만 접근 가능합니다.<br>' +
      '- 현재 사용자의 보유 캐릭터만 반환되며, 다른 사용자의 캐릭터는 조회 불가능합니다.<br>',
  })
  @ApiOkResponse({
    description: '내 보유 캐릭터 목록 조회 성공',
    type: CharacterListResponseDto,
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Get('my')
  async findMyCharacters(
    @User() user: UserInfo,
  ): Promise<CharacterListResponseDto> {
    const result = await this.findMyCharacterListUseCase.execute({
      userId: user.userId,
    });

    return CharacterTransformer.toListResponse(result);
  }
}
