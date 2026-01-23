import { ApiProperty } from '@nestjs/swagger';

class ActiveEventInfoResponseDto {
  @ApiProperty({
    description: '일정 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440999',
  })
  groupId: string;

  @ApiProperty({
    description: '일정 시간',
    example: '2026-01-18T13:00:00.000Z',
  })
  eventTime: Date;

  @ApiProperty({
    description: '추적 시작 시간',
    example: '2026-01-18T12:45:00.000Z',
  })
  trackingStartTime: Date;

  @ApiProperty({
    description: '종료 시간',
    example: '2026-01-18T13:01:00.000Z',
  })
  endTime: Date;
}

export class ActiveEventResponseDto {
  @ApiProperty({
    description: '진행중인 일정 존재 여부',
    example: true,
  })
  hasActiveEvent: boolean;

  @ApiProperty({
    description: '진행중인 일정 정보 (없으면 null)',
    type: ActiveEventInfoResponseDto,
    nullable: true,
  })
  event: ActiveEventInfoResponseDto | null;
}
