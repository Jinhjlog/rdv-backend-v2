import { ApiProperty } from '@nestjs/swagger';

export class NotificationSubscriptionResponseDto {
  @ApiProperty({
    type: String,
    description: '알림 타입',
    example: 'MEETING',
    enum: ['MEETING', 'CHARACTER', 'ATTENDANCE', 'SYSTEM'],
  })
  type: string;

  @ApiProperty({
    type: Boolean,
    description: '구독 여부 (true: 수신, false: 수신 거부)',
    example: true,
  })
  isSubscribed: boolean;
}

export class NotificationSubscriptionsResponseDto {
  @ApiProperty({
    description: '알림 타입별 구독 설정 목록',
    type: [NotificationSubscriptionResponseDto],
  })
  items: NotificationSubscriptionResponseDto[];
}
