import { CanActivate, Injectable } from '@nestjs/common';
import { AuthorizationException } from '@shared/exception';

@Injectable()
export class LocalOnlyGuard implements CanActivate {
  canActivate(): boolean {
    if (process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'test') {
      throw new AuthorizationException({
        message: '이 API 버전은 더 이상 사용할 수 없습니다. v2를 사용하세요.',
        errorCode: 'API_VERSION_DEPRECATED',
      });
    }

    return true;
  }
}
