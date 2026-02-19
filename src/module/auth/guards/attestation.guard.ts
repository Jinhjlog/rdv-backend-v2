import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthorizationException } from '@shared/exception';
import { AttestationService } from '../services/attestation.service';
import { EnvironmentConfig } from '@core/config/environment.config';

type Platform = 'android' | 'ios';

@Injectable()
export class AttestationGuard implements CanActivate {
  private readonly logger = new Logger(AttestationGuard.name);
  private readonly enabled: boolean;

  constructor(
    private readonly attestationService: AttestationService,
    configService: ConfigService<EnvironmentConfig>,
  ) {
    this.enabled =
      configService.get('appSecurity.attestation.enabled', { infer: true }) ??
      false;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const platform = (
      request.headers['x-platform'] as string
    )?.toLowerCase() as Platform;
    const attestationToken = request.headers['x-attestation-token'] as string;

    if (!platform || !['android', 'ios'].includes(platform)) {
      throw new AuthorizationException({
        message: '지원하지 않는 플랫폼입니다',
        errorCode: 'UNSUPPORTED_PLATFORM',
      });
    }

    if (!attestationToken) {
      throw new AuthorizationException({
        message: 'Attestation 토큰이 제공되지 않았습니다',
        errorCode: 'ATTESTATION_REQUIRED',
      });
    }

    const result =
      platform === 'android'
        ? await this.attestationService.verifyAndroid(attestationToken)
        : await this.attestationService.verifyIos(attestationToken);

    if (!result.valid) {
      this.logger.warn(
        `Attestation 검증 실패 - platform: ${platform}, reason: ${result.reason}`,
      );
      throw new AuthorizationException({
        message: result.reason || 'Attestation 검증에 실패했습니다',
        errorCode: 'ATTESTATION_FAILED',
      });
    }

    return true;
  }
}
