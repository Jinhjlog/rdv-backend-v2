import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiHeader } from '@nestjs/swagger';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { AttestationGuard } from '../guards/attestation.guard';

/**
 * 공개 API에 API Key + Platform Attestation 검증을 적용하는 데코레이터
 * JWT 인증이 불필요한 인증 API (회원가입, 로그인 등)에 사용합니다.
 */
export const PublicAuth = () =>
  applyDecorators(
    UseGuards(ApiKeyGuard, AttestationGuard),
    ApiHeader({
      name: 'X-API-Key',
      description: '앱에 내장된 API Key',
      required: true,
    }),
    ApiHeader({
      name: 'X-Platform',
      description: '클라이언트 플랫폼 (android | ios)',
      required: true,
      enum: ['android', 'ios'],
    }),
    ApiHeader({
      name: 'X-Attestation-Token',
      description:
        'Platform Attestation 토큰 (Android: Play Integrity, iOS: App Attest)',
      required: true,
    }),
    ApiForbiddenResponse({
      description:
        'API Key 누락/불일치: _**INVALID_API_KEY**_</br>' +
        'Attestation 토큰 누락: _**ATTESTATION_REQUIRED**_</br>' +
        'Attestation 검증 실패: _**ATTESTATION_FAILED**_</br>' +
        '지원하지 않는 플랫폼: _**UNSUPPORTED_PLATFORM**_',
    }),
  );
