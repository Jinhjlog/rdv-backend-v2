import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';

/**
 * 앱 버전 수정 Request DTO
 */
export class UpdateAppVersionRequestDto {
  @ApiProperty({
    description: '플랫폼',
    enum: ['ANDROID', 'IOS'],
    example: 'ANDROID',
  })
  @IsNotEmpty()
  @IsString()
  platform: string;

  @ApiProperty({
    description: '최신 버전 (Semantic Versioning)',
    example: '1.2.0',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: '버전은 Semantic Versioning 형식이어야 합니다 (예: 1.2.0)',
  })
  latestVersion: string;

  @ApiProperty({
    description: '최소 필수 버전 (Semantic Versioning)',
    example: '1.0.0',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: '버전은 Semantic Versioning 형식이어야 합니다 (예: 1.0.0)',
  })
  minRequiredVersion: string;

  @ApiProperty({
    description: '스토어 URL',
    example: 'https://play.google.com/store/apps/details?id=com.example.app',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: '유효한 URL 형식이어야 합니다' })
  storeUrl: string;
}
