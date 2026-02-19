import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({
    type: Number,
    description: '미읽음 알림 개수',
    example: 4,
  })
  count: number;
}
