import { AuthResultStatus } from '@core/jwt/interfaces';
import { JwtService } from '@core/jwt/jwt.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class UserRefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('리프래시 토큰이 제공되지 않았습니다.');
    }

    const refreshToken = authHeader.split(' ')[1];
    if (!refreshToken) {
      throw new UnauthorizedException('유효하지 않은 리프래시 토큰입니다.');
    }

    const isBlacklisted =
      await this.jwtService.isRefreshTokenBlacklisted(refreshToken);

    if (isBlacklisted.status !== AuthResultStatus.SUCCESS) {
      throw new UnauthorizedException(
        '블랙리스트에 등록된 리프래시 토큰입니다.',
      );
    }

    const isVerified = await this.jwtService.verifyRefreshToken(refreshToken);
    if (isVerified.status !== AuthResultStatus.SUCCESS) {
      throw new UnauthorizedException('유효하지 않은 리프래시 토큰입니다.');
    }

    request['refreshToken'] = refreshToken;

    return true;
  }
}
