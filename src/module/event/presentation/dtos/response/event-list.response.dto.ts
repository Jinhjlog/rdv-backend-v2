import { ApiProperty } from '@nestjs/swagger';

class EventListItemResponseDto {
  @ApiProperty({
    description: '일정 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '일정 제목',
    example: '정기 모임',
  })
  title: string;

  @ApiProperty({
    description: '일정 시간',
    example: '2026-01-18T13:00:00.000Z',
  })
  eventTime: Date;

  @ApiProperty({
    description: '도로명 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  locationAddress: string;

  @ApiProperty({
    description: '상세 주소',
    example: '3층 회의실',
  })
  locationDetail: string;

  @ApiProperty({
    description: '일정 상태 [모집중, 진행중, 종료]',
    enum: ['RECRUITING', 'IN_PROGRESS', 'ENDED'],
    example: 'RECRUITING',
  })
  status: string;

  @ApiProperty({
    description: '참여자 user Id 목록',
    example: [{ userId: '550e8400-e29b-41d4-a716-446655440000' }],
  })
  participants: { userId: string }[];

  @ApiProperty({
    description: '최대 참여자 수',
    example: 10,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '생성일',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class EventListResponseDto {
  @ApiProperty({
    description: '일정 목록',
    type: [EventListItemResponseDto],
  })
  items: EventListItemResponseDto[];
}
