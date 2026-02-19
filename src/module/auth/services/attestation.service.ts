export interface AttestationVerifyResult {
  valid: boolean;
  reason?: string;
}

/**
 * Platform Attestation 검증 서비스 인터페이스
 * Android(Play Integrity) / iOS(App Attest) 검증을 추상화합니다.
 */
export abstract class AttestationService {
  abstract verifyAndroid(token: string): Promise<AttestationVerifyResult>;
  abstract verifyIos(token: string): Promise<AttestationVerifyResult>;
}
