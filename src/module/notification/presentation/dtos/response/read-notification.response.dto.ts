import { ApiProperty } from '@nestjs/swagger';

export class ReadNotificationResponseDto {
  @ApiProperty({
    type: String,
    description: '알림 ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    type: Boolean,
    description: '읽음 여부',
    example: true,
  })
  isRead: boolean;

  @ApiProperty({
    type: String,
    description: '읽음 처리 시각 (ISO 8601)',
    example: '2026-02-18T14:30:00.000Z',
  })
  readAt: string;
}
