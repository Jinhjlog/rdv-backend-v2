import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class RegisterDeviceTokenRequestDto {
  @ApiProperty({
    description: 'FCM 디바이스 토큰',
    example: 'dGVzdC10b2tlbi1mb3ItZmNtLWRldmljZS10b2tlbi1yZWdpc3RyYXRpb24...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: '디바이스 플랫폼',
    enum: ['IOS', 'ANDROID'],
    example: 'IOS',
  })
  @IsNotEmpty()
  @IsIn(['IOS', 'ANDROID'])
  platform: 'IOS' | 'ANDROID';

  @ApiProperty({
    description: '디바이스 정보 (모델명, OS 버전 등)',
    example: 'iPhone 15 Pro, iOS 17.2',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
