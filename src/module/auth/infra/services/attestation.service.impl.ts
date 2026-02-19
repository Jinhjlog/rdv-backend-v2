import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import {
  AttestationService,
  AttestationVerifyResult,
} from '../../services/attestation.service';
import { EnvironmentConfig } from '@core/config/environment.config';

/**
 * Play Integrity API 응답 타입
 *
 * decodeIntegrityToken API가 반환하는 verdict 구조:
 * @see https://developer.android.com/google/play/integrity/verdicts
 */
interface PlayIntegrityVerdict {
  requestDetails?: {
    requestPackageName?: string;
    nonce?: string;
    timestampMillis?: string;
  };
  appIntegrity?: {
    appRecognitionVerdict?: string; // PLAY_RECOGNIZED | UNRECOGNIZED_VERSION | UNEVALUATED
    packageName?: string;
    certificateSha256Digest?: string[];
    versionCode?: string;
  };
  deviceIntegrity?: {
    deviceRecognitionVerdict?: string[]; // MEETS_DEVICE_INTEGRITY, MEETS_BASIC_INTEGRITY 등
  };
  accountDetails?: {
    appLicensingVerdict?: string; // LICENSED | UNLICENSED | UNEVALUATED
  };
}

/**
 * Platform Attestation 검증 구현체
 *
 * - Android: Google Play Integrity API 토큰 검증
 * - iOS: Apple App Attest assertion 검증 (미구현)
 *
 * 환경변수 ATTESTATION_ENABLED=false 인 경우 검증을 건너뜁니다 (개발 환경용).
 */
@Injectable()
export class AttestationServiceImpl extends AttestationService {
  private readonly logger = new Logger(AttestationServiceImpl.name);
  private readonly enabled: boolean;
  private readonly googlePackageName: string;
  private readonly googleAuth: GoogleAuth;

  constructor(configService: ConfigService<EnvironmentConfig>) {
    super();
    const attestationConfig = configService.get('appSecurity.attestation', {
      infer: true,
    });
    const firebaseConfig = configService.get('firebase', { infer: true });

    this.enabled = attestationConfig?.enabled ?? false;
    this.googlePackageName = attestationConfig?.googlePackageName ?? '';

    // Firebase와 동일한 서비스 계정 자격증명을 재활용하여 Google API 인증
    this.googleAuth = new GoogleAuth({
      credentials: {
        client_email: firebaseConfig?.clientEmail,
        private_key: firebaseConfig?.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/playintegrity'],
    });
  }

  /**
   * Android Play Integrity 토큰 검증
   *
   * 플로우:
   * 1. 앱에서 받은 integrity token을 Google API로 복호화 요청
   * 2. Google이 반환한 verdict(판정 결과)에서 앱/기기 무결성 확인
   * 3. 패키지명이 우리 앱인지, 정품 기기인지 검증
   *
   * @param token 앱에서 전달받은 Play Integrity 토큰
   */
  async verifyAndroid(token: string): Promise<AttestationVerifyResult> {
    if (!this.enabled) {
      this.logger.debug('Attestation 비활성화 상태 - Android 검증 건너뜀');
      return { valid: true };
    }

    try {
      // 1. Google API 호출하여 integrity token 복호화
      const verdict = await this.decodeIntegrityToken(token);

      // 2. 패키지명 검증 - 우리 앱에서 보낸 요청인지 확인
      const requestPackageName =
        verdict.requestDetails?.requestPackageName ?? '';
      if (requestPackageName !== this.googlePackageName) {
        this.logger.warn(
          `패키지명 불일치: expected=${this.googlePackageName}, actual=${requestPackageName}`,
        );
        return {
          valid: false,
          reason: '앱 패키지명이 일치하지 않습니다',
        };
      }

      // 3. 앱 무결성 검증 - Google Play에서 설치된 정품 앱인지 확인
      const appVerdict = verdict.appIntegrity?.appRecognitionVerdict ?? '';
      if (appVerdict !== 'PLAY_RECOGNIZED') {
        this.logger.warn(`앱 무결성 검증 실패: verdict=${appVerdict}`);
        return {
          valid: false,
          reason: '인식되지 않은 앱입니다',
        };
      }

      // 4. 기기 무결성 검증 - 루팅되지 않은 정상 기기인지 확인
      const deviceVerdicts =
        verdict.deviceIntegrity?.deviceRecognitionVerdict ?? [];
      if (!deviceVerdicts.includes('MEETS_DEVICE_INTEGRITY')) {
        this.logger.warn(
          `기기 무결성 검증 실패: verdicts=${JSON.stringify(deviceVerdicts)}`,
        );
        return {
          valid: false,
          reason: '기기 무결성 검증에 실패했습니다',
        };
      }

      this.logger.debug('Play Integrity 검증 성공');
      return { valid: true };
    } catch (error) {
      this.logger.error(`Play Integrity 검증 실패: ${error}`);
      return {
        valid: false,
        reason: 'Play Integrity 토큰 검증에 실패했습니다',
      };
    }
  }

  /**
   * Google Play Integrity API에 토큰 복호화 요청
   *
   * API: POST https://playintegrity.googleapis.com/v1/{packageName}:decodeIntegrityToken
   * 인증: Firebase 서비스 계정의 OAuth2 토큰 사용
   *
   * @see https://developer.android.com/google/play/integrity/verdict#decrypt-verify-google-servers
   */
  private async decodeIntegrityToken(
    token: string,
  ): Promise<PlayIntegrityVerdict> {
    const client = await this.googleAuth.getClient();
    const url = `https://playintegrity.googleapis.com/v1/${this.googlePackageName}:decodeIntegrityToken`;

    const response = await client.request<{
      tokenPayloadExternal: PlayIntegrityVerdict;
    }>({
      url,
      method: 'POST',
      data: { integrity_token: token },
    });

    return response.data.tokenPayloadExternal;
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async verifyIos(token: string): Promise<AttestationVerifyResult> {
    if (!this.enabled) {
      this.logger.debug('Attestation 비활성화 상태 - iOS 검증 건너뜀');
      return { valid: true };
    }

    // TODO: Apple App Attest 구현 (iOS 별도 진행)
    this.logger.warn('App Attest 검증 미구현 - iOS 별도 진행 예정');
    return { valid: true };
  }
}
