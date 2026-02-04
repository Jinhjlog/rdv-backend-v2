/**
 * 언락 설정 조회 요청 DTO
 */
export class GetUnlockConfigDto {
  userId: string;
}

/**
 * 언락 설정 조회 결과 DTO
 */
export class GetUnlockConfigResultDto {
  needsUnlockTracking: boolean;
  trackableEventTypes: string[];
}
