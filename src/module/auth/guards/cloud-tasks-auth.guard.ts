import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Request } from 'express';
import { AuthenticationException } from '@shared/exception';
import { EnvironmentConfig } from '@core/config/environment.config';

/**
 * Cloud Tasks OIDC 토큰 검증 Guard
 *
 * - Cloud Tasks가 발급한 OIDC 토큰만 통과 허용
 * - audience: 우리 엔드포인트 URL과 일치해야 함
 * - email: 설정된 invoker 서비스 계정과 일치해야 함
 * - 외부에서 내부 엔드포인트로의 직접 호출 방어
 */
@Injectable()
export class CloudTasksAuthGuard implements CanActivate {
  private readonly logger = new Logger(CloudTasksAuthGuard.name);
  private readonly oauthClient = new OAuth2Client();
  private readonly expectedAudience: string;
  private readonly expectedEmail: string;

  constructor(configService: ConfigService<EnvironmentConfig>) {
    this.expectedAudience =
      configService.get('queue.cloudTasks.targetUrl', { infer: true }) ?? '';
    this.expectedEmail =
      configService.get('queue.cloudTasks.invokerServiceAccount', {
        infer: true,
      }) ?? '';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn(`OIDC 토큰 누락 - IP: ${request.ip}`);
      throw new AuthenticationException({
        message: 'OIDC 토큰이 제공되지 않았습니다',
        errorCode: 'CLOUD_TASKS_TOKEN_MISSING',
      });
    }

    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: this.expectedAudience,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new AuthenticationException({
          message: 'OIDC 토큰 payload가 비어있습니다',
          errorCode: 'CLOUD_TASKS_TOKEN_INVALID',
        });
      }

      if (payload.email !== this.expectedEmail) {
        this.logger.warn(
          `OIDC 토큰 발급자 불일치 - 예상: ${this.expectedEmail}, 실제: ${payload.email}`,
        );
        throw new AuthenticationException({
          message: '유효하지 않은 OIDC 토큰 발급자입니다',
          errorCode: 'CLOUD_TASKS_TOKEN_INVALID_ISSUER',
        });
      }

      return true;
    } catch (error) {
      if (error instanceof AuthenticationException) {
        throw error;
      }

      this.logger.warn(
        `OIDC 토큰 검증 실패 - ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw new AuthenticationException({
        message: '유효하지 않은 OIDC 토큰입니다',
        errorCode: 'CLOUD_TASKS_TOKEN_INVALID',
      });
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return null;

    return token;
  }
}
