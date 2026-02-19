import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthorizationException } from '@shared/exception';
import { EnvironmentConfig } from '@core/config/environment.config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly apiKey: string;

  constructor(configService: ConfigService<EnvironmentConfig>) {
    this.apiKey =
      configService.get('appSecurity.apiKey', { infer: true }) ?? '';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'] as string;

    if (!providedKey) {
      this.logger.warn(`API Key 누락 - IP: ${request.ip}`);
      throw new AuthorizationException({
        message: 'API Key가 제공되지 않았습니다',
        errorCode: 'INVALID_API_KEY',
      });
    }

    if (providedKey !== this.apiKey) {
      this.logger.warn(`API Key 불일치 - IP: ${request.ip}`);
      throw new AuthorizationException({
        message: '유효하지 않은 API Key입니다',
        errorCode: 'INVALID_API_KEY',
      });
    }

    return true;
  }
}
