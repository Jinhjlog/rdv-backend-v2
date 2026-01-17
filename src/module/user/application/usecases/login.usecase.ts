import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories';
import { AuthService } from '../../domain/services';
import { AuthUserDto, LoginDto } from '../dtos';
import { AuthenticationException } from '@shared/exception';

/**
 * 자동 로그인 UseCase
 *
 * 기존 사용자의 deviceId로 인증하고 토큰을 발급합니다
 */
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthUserDto> {
    // 1. 사용자 조회
    const user = await this.userRepository.findByDeviceId(dto.deviceId);

    if (!user) {
      throw new AuthenticationException({
        message: '사용자를 찾을 수 없거나 인증에 실패했습니다.',
        errorCode: 'AUTHENTICATION_FAILED',
      });
    }

    const tokens = await this.authService.login(user);

    // 4. 사용자 정보 반환
    return tokens;
  }
}
