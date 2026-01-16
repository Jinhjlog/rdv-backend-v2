import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { USER_JWT_STRATEGY } from '../strategies';

@Injectable()
export class UserJwtAuthGuard extends AuthGuard(USER_JWT_STRATEGY) {
  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('토큰이 만료되었습니다');
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (err || !user) {
      throw new UnauthorizedException('인증에 실패하였습니다.');
    }

    return user as TUser;
  }
}
