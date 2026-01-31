import { ApiProperty } from '@nestjs/swagger';

/**
 * 앱 버전 조회 Response DTO
 */
export class AppVersionResponseDto {
  @ApiProperty({
    description: '최신 버전',
    example: '1.2.0',
  })
  latestVersion: string;

  @ApiProperty({
    description: '최소 필수 버전',
    example: '1.0.0',
  })
  minRequiredVersion: string;

  @ApiProperty({
    description: '스토어 URL',
    example: 'https://play.google.com/store/apps/details?id=com.example.app',
  })
  storeUrl: string;
}
