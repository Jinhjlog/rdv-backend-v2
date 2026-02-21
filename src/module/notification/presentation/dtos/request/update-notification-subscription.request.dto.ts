import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateNotificationSubscriptionRequestDto {
  @ApiProperty({
    type: Boolean,
    description: '구독 여부 (true: 수신, false: 수신 거부)',
    example: false,
  })
  @IsBoolean()
  isSubscribed: boolean;
}
