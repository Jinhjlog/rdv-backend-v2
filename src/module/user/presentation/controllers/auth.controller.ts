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
  ApiCreatedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import {
  CheckAccountExistsUseCase,
  LoginUseCase,
  RegisterUseCase,
} from '../../application/usecases';
import {
  AuthUserResponseDto,
  CheckAccountExistsRequestDto,
  CheckAccountExistsResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
} from '../dtos';

@ApiTags('인증 - Auth 관리')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly checkAccountExistsUseCase: CheckAccountExistsUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
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

  @ApiOperation({
    summary: '게스트 - 회원가입',
    description:
      '신규 사용자 계정을 생성하고 자동 로그인합니다.<br><br>' +
      '**목적**<br>' +
      '앱 실행 시 신규 사용자의 계정을 생성하고 accessToken, refreshToken을 발급하여 자동 로그인합니다.<br><br>' +
      '**필수 항목**<br>' +
      '- deviceId (비어있지 않은 문자열)<br>' +
      '- nickname (2~5자 문자열)<br>' +
      '- preferredThemeColor (비어있지 않은 문자열)<br><br>' +
      '**주의사항**<br>' +
      '- deviceId는 이미 가입한 기기인 경우 중복 오류 발생<br>' +
      '- nickname은 2자 이상 5자 이하여야 합니다.<br>' +
      '- 사용자 생성 시 기본 캐릭터와 네임태그가 자동 할당됩니다.<br>',
  })
  @ApiCreatedResponse({
    description: '사용자 계정 생성 및 토큰 발급 완료',
    type: AuthUserResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '잘못된 요청 (필드 검증 실패 등)<br>' +
      '**deviceId**<br>' +
      '- deviceId가 비어있거나 문자열이 아닌 경우<br>' +
      '<br>' +
      '**nickname**<br>' +
      '- nickname이 비어있거나 문자열이 아닌 경우<br>' +
      '- nickname이 2자 미만인 경우: _**NICKNAME_TOO_SHORT**_<br>' +
      '- nickname이 5자를 초과하는 경우: _**NICKNAME_TOO_LONG**_<br>' +
      '<br>' +
      '**preferredThemeColor**<br>' +
      '- preferredThemeColor가 비어있거나 문자열이 아닌 경우<br>',
  })
  @ApiConflictResponse({
    description:
      '리소스 충돌<br>' +
      '- deviceId가 이미 가입된 경우: _**USER_ALREADY_EXISTS**_<br>',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<AuthUserResponseDto> {
    return await this.registerUseCase.execute(dto);
  }
}
