import { ApiProperty } from '@nestjs/swagger';

export class UnlockConfigResponseDto {
  @ApiProperty({
    description: '언락 트래킹 필요 여부',
    example: true,
  })
  needsUnlockTracking: boolean;

  @ApiProperty({
    description: '트래킹 가능한 이벤트 타입 목록',
    example: ['MENU_ACCESSED', 'FIRST_ACTION'],
    type: [String],
  })
  trackableEventTypes: string[];
}
