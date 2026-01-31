/**
 * 앱 버전 수정 DTO
 */
export interface UpdateAppVersionDto {
  platform: string;
  latestVersion: string;
  minRequiredVersion: string;
  storeUrl: string;
}
