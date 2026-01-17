import { Controller, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserAuth, User } from '../../../auth/decorators';
import { UserInfo } from '../../../auth/interfaces';
import { ChangeCharacterUseCase } from '../../application/usecases/change-character.usecase';
import { ChangeCharacterRequestDto } from '../dtos/request/change-character.request.dto';
import { UserResponseDto } from '../dtos/response/user.response.dto';
import { FindUserUseCase } from '../../application/usecases';
import { UserTransformer } from '../transformers';

@ApiTags('사용자 - 사용자')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(
    private readonly changeCharacterUseCase: ChangeCharacterUseCase,
    private readonly findUserUseCase: FindUserUseCase,
  ) {}

  @ApiOperation({
    summary: '인증 사용자 - 캐릭터 변경',
    description:
      '사용자의 현재 보유 캐릭터를 변경합니다.<br><br>' +
      '**목적**<br>' +
      '사용자가 보유한 캐릭터 중 하나를 선택하여 현재 사용 캐릭터를 변경합니다.<br><br>' +
      '**동작**<br>' +
      '- 요청한 캐릭터가 사용자 보유 목록에 있는지 검증<br>' +
      '- 캐릭터 변경 시 사용자 정보의 characterCode 업데이트<br>' +
      '- 변경된 사용자 정보 반환<br><br>' +
      '**필수 항목**<br>' +
      'characterCode (비어있지 않은 문자열)<br><br>' +
      '**주의사항**<br>' +
      '- 보유한 캐릭터로만 변경 가능합니다.<br>' +
      '- 언제든지 자유롭게 변경 가능합니다 (쿨타임, 비용 없음).<br>' +
      '- 변경 즉시 반영되며 updatedAt이 업데이트됩니다.<br>',
  })
  @ApiOkResponse({
    description: '캐릭터 변경 성공 및 변경된 사용자 정보 반환',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**characterCode**<br>' +
      '- characterCode가 비어있거나 문자열이 아닌 경우<br>' +
      '- 보유하지 않은 캐릭터를 선택한 경우: _**CHARACTER_NOT_OWNED**_<br>',
  })
  @ApiNotFoundResponse({
    description:
      '리소스를 찾을 수 없음<br>' +
      '- 사용자를 찾을 수 없는 경우: _**USER_NOT_FOUND**_<br>',
  })
  @ApiUnauthorizedResponse({
    description:
      '인증 실패<br>' +
      '- 유효하지 않은 토큰 또는 만료된 토큰: _**AUTHENTICATION_FAILED**_<br>',
  })
  @UserAuth()
  @HttpCode(HttpStatus.OK)
  @Patch('character')
  async changeCharacter(
    @Body() dto: ChangeCharacterRequestDto,
    @User() user: UserInfo,
  ): Promise<UserResponseDto> {
    await this.changeCharacterUseCase.execute({
      userId: user.userId,
      characterCode: dto.characterCode,
    });

    const userModel = await this.findUserUseCase.execute({
      userId: user.userId,
    });
    return UserTransformer.toDetailResponse(userModel);
  }
}
