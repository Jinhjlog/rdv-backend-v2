import { ApiProperty } from '@nestjs/swagger';

export class ReadAllNotificationsResponseDto {
  @ApiProperty({
    type: Number,
    description: '읽음 처리된 알림 개수',
    example: 4,
  })
  updatedCount: number;
}
