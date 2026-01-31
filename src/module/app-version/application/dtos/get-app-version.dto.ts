/**
 * 앱 버전 조회 입력 DTO
 */
export interface GetAppVersionDto {
  platform: string;
}

/**
 * 앱 버전 조회 결과 DTO
 */
export interface GetAppVersionResultDto {
  latestVersion: string;
  minRequiredVersion: string;
  storeUrl: string;
}
