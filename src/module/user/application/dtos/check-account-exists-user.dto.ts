/**
 * 계정 존재 확인 요청 DTO
 */
export class CheckAccountExistsRequestDto {
  /**
   * OS 제공 디바이스 ID
   */
  deviceId: string;
}

/**
 * 계정 존재 확인 응답 DTO
 */
export class CheckAccountExistsResponseDto {
  /**
   * 계정 존재 여부
   * true: 기존 사용자 (자동 로그인 플로우)
   * false: 신규 사용자 (회원가입 플로우)
   */
  exists: boolean;
}
