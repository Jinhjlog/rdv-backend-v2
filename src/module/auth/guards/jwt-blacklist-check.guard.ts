import { JwtService } from '@core/jwt/jwt.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express'; // Express Request 타입 추가
import { AuthResultStatus } from '@core/jwt/interfaces';

/**
 * JWT 블랙리스트 체크 가드
 * - 액세스 토큰이 블랙리스트에 등록되어 있는지 확인합니다.
 * - 블랙리스트에 등록된 경우 만료되어있는 것으로 판단하여 만료 예외를 발생시킵니다.
 */
@Injectable()
export class JwtBlacklistCheckGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!token) {
      return true;
    }

    const isBlacklisted = await this.jwtService.isAccessTokenBlacklisted(token);

    if (isBlacklisted.status !== AuthResultStatus.SUCCESS) {
      throw new UnauthorizedException('토큰이 만료되었습니다');
    }

    return true;
  }
}
