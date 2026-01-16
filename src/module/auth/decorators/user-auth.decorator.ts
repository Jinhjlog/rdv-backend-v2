import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtBlacklistCheckGuard, UserJwtAuthGuard } from '../guards';

/**
 * 고객 인증이 필요한 API에 적용하는 데코레이터
 * JWT 검증과 블랙리스트 확인을 함께 수행합니다.
 */
export const UserAuth = () =>
  applyDecorators(
    UseGuards(UserJwtAuthGuard, JwtBlacklistCheckGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({
      description:
        '토큰이 만료됨: _**ACCESS_TOKEN_EXPIRED**_</br>' +
        '유효하지 않은 토큰: _**INVALID_ACCESS_TOKEN**_</br>' +
        '인증 실패: _**UNAUTHORIZED**_',
    }),
  );
