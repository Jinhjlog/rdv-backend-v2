import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthenticationException } from '@shared/exception';
import { EnvironmentConfig } from '@core/config/environment.config';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(AdminApiKeyGuard.name);
  private readonly adminApiKey: string;

  constructor(configService: ConfigService<EnvironmentConfig>) {
    this.adminApiKey =
      configService.get('appSecurity.adminApiKey', { infer: true }) ?? '';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'] as string;

    if (!providedKey) {
      this.logger.warn(`Admin API Key 누락 - IP: ${request.ip}`);
      throw new AuthenticationException({
        message: 'API Key가 제공되지 않았습니다',
        errorCode: 'INVALID_API_KEY',
      });
    }

    if (providedKey !== this.adminApiKey) {
      this.logger.warn(`Admin API Key 불일치 - IP: ${request.ip}`);
      throw new AuthenticationException({
        message: '유효하지 않은 API Key입니다',
        errorCode: 'INVALID_API_KEY',
      });
    }

    return true;
  }
}
