import { EnvironmentConfig } from '@core/config/environment.config';
import { TokenPayload } from '@core/jwt/interfaces';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserInfo, UserJwtPayload } from '../interfaces';
import { UserRepository } from '../infra';

export const USER_JWT_STRATEGY = 'user-jwt' as const;

@Injectable()
export class UserJwtStrategy extends PassportStrategy(
  Strategy,
  USER_JWT_STRATEGY,
) {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    const jwtConfig = configService.get<EnvironmentConfig['jwt']>('jwt');

    if (!jwtConfig) {
      throw new Error('JWT 설정이 누락되었습니다');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: TokenPayload<UserJwtPayload>): Promise<UserInfo> {
    if (!payload || !payload.payload) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const user = await this.userRepository.findById(payload.payload.userId);

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const { userId } = payload.payload;

    return {
      userId: userId,
      nickname: user.nickname,
      nameTag: user.nameTag,
    };
  }
}
