import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 앱 버전 조회 Request DTO (Query)
 */
export class GetAppVersionRequestDto {
  @ApiProperty({
    description: '플랫폼',
    enum: ['ANDROID', 'IOS'],
    example: 'ANDROID',
  })
  @IsNotEmpty()
  @IsString()
  platform: string;
}
