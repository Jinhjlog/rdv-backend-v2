import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithRefreshToken extends Request {
  refreshToken?: string;
}

/**
 * 리프레시 토큰을 가져오는 데코레이터
 *
 * 반드시 UserRefreshTokenGuard와 함께 사용해야 합니다.
 *
 * @example
 * @UseGuards(UserRefreshTokenGuard)
 * @HttpCode(HttpStatus.OK)
 * @Post('refresh-token')
 * refreshToken(@UserRefreshToken() refreshToken: string) {
 *   // refreshToken을 사용하여 새로운 토큰 발급
 *   return this.authService.refreshToken(refreshToken);
 * }
 */
export const UserRefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithRefreshToken>();
    // 가드에서 리프래시 토큰 검증을 진행했으므로 타입 단언을 사용
    const refreshToken = request.refreshToken as string;

    return refreshToken;
  },
);
