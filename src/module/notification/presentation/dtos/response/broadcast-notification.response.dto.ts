import { ApiProperty } from '@nestjs/swagger';

export class BroadcastNotificationResponseDto {
  @ApiProperty({
    description: '알림이 생성된 유저 수',
    example: 1024,
  })
  notifiedUserCount: number;
}
