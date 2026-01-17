import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CheckAccountExistsUseCase,
  LoginUseCase,
} from '../../application/usecases';
import {
  AuthUserResponseDto,
  CheckAccountExistsRequestDto,
  CheckAccountExistsResponseDto,
  LoginRequestDto,
} from '../dtos';

@ApiTags('인증 - Auth 관리')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly checkAccountExistsUseCase: CheckAccountExistsUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @ApiOperation({
    summary: '게스트 - 계정 존재 확인',
    description:
      'deviceId로 계정 존재 여부를 확인합니다.<br><br>' +
      '**목적**<br>' +
      '앱 실행 시 기존 계정 존재 여부를 확인하여 자동 로그인 또는 회원가입 플로우로 분기합니다.<br><br>' +
      '**동작**<br>' +
      '- deviceId가 존재하면 exists: true 반환 (자동 로그인 플로우)<br>' +
      '- deviceId가 존재하지 않으면 exists: false 반환 (회원가입 플로우)<br><br>' +
      '**필수 항목**<br>' +
      'deviceId (UUID 형식)<br><br>' +
      '**주의사항**<br>' +
      '- deviceId는 반드시 UUID 형식이어야 합니다.<br>',
  })
  @ApiOkResponse({
    description: '계정 존재 확인 성공',
    type: CheckAccountExistsResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**deviceId**<br>' +
      '- deviceId가 유효한 UUID 형식이 아닌 경우',
  })
  @ApiQuery({
    name: 'deviceId',
    description: 'OS 제공 디바이스 ID',
    example: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('check-account')
  async checkAccount(
    @Query() dto: CheckAccountExistsRequestDto,
  ): Promise<CheckAccountExistsResponseDto> {
    return await this.checkAccountExistsUseCase.execute(dto);
  }

  @ApiOperation({
    summary: '게스트 - 로그인',
    description:
      '기존 사용자의 deviceId로 인증하고 JWT 토큰을 발급합니다.<br><br>' +
      '**목적**<br>' +
      '앱 실행 시 기존 사용자를 자동으로 로그인하고 accessToken, refreshToken을 발급합니다.<br><br>' +
      '**필수 항목**<br>' +
      'deviceId (비어있지 않은 문자열)<br><br>' +
      '**주의사항**<br>' +
      '- deviceId는 필수 입력값입니다.<br>' +
      '- 등록되지 않은 deviceId는 인증에 실패합니다.<br>',
  })
  @ApiOkResponse({
    description: '로그인 성공 및 토큰 발급 완료',
    type: AuthUserResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**deviceId**<br>' +
      '- deviceId가 비어있거나 문자열이 아닌 경우<br>',
  })
  @ApiUnauthorizedResponse({
    description:
      '인증 실패<br>' +
      '- 등록되지 않은 deviceId: _**AUTHENTICATION_FAILED**_<br>',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginRequestDto): Promise<AuthUserResponseDto> {
    return this.loginUseCase.execute(dto);
  }
}
