import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserInfo } from '../interfaces';

/**
 * 현재 인증된 사용자 정보를 컨트롤러의 파라미터로 주입하는 데코레이터
 * 무조건 `@UserAuth()`와 함께 사용해야 합니다.
 *
 * @example
 * ```typescript
 * @UserAuth()
 * @Get('profile')
 * getProfile(@User() user: UserInfo) {
 *   console.log(`고객 ID: ${user.userId}`);
 *   return { id: user.userId };
 * }
 * ```
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as UserInfo;
  },
);
