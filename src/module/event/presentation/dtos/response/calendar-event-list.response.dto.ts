import { ApiProperty } from '@nestjs/swagger';

class CalendarEventListItemResponseDto {
  @ApiProperty({
    description: '일정 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  groupId: string;

  @ApiProperty({
    description: '모임 이름',
    example: '개발자 스터디',
  })
  groupName: string;

  @ApiProperty({
    description: '일정 제목',
    example: '정기 모임',
  })
  title: string;

  @ApiProperty({
    description: '일정 시간',
    example: '2026-01-15T18:00:00.000Z',
  })
  eventTime: Date;

  @ApiProperty({
    description: '도로명 주소',
    example: '서울시 강남구 테헤란로 123',
  })
  locationAddress: string;

  @ApiProperty({
    description: '상세 주소',
    example: '3층 회의실',
  })
  locationDetail: string;

  @ApiProperty({
    description: '일정 상태',
    enum: ['RECRUITING', 'IN_PROGRESS'],
    example: 'RECRUITING',
  })
  status: string;

  @ApiProperty({
    description: '현재 사용자의 참여 여부',
    example: true,
  })
  isParticipant: boolean;
}

export class CalendarEventListResponseDto {
  @ApiProperty({
    description: '일정 목록',
    type: [CalendarEventListItemResponseDto],
  })
  items: CalendarEventListItemResponseDto[];
}
