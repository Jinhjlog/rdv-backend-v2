import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveDeviceTokenRequestDto {
  @ApiProperty({
    description: '삭제할 FCM 디바이스 토큰',
    example: 'dGVzdC10b2tlbi1mb3ItZmNtLWRldmljZS10b2tlbi1yZWdpc3RyYXRpb24...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
