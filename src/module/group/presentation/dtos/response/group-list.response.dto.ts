import { ApiProperty } from '@nestjs/swagger';

export class LastEndedEventResponseDto {
  @ApiProperty({
    description: '일정 시간',
    example: '2025-01-15T14:00:00.000Z',
  })
  eventTime: Date;

  @ApiProperty({
    description: '주소 상세',
    example: '2층 스타벅스 앞',
  })
  locationDetail: string;
}

export class GroupListItemResponseDto {
  @ApiProperty({
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '모임 이름',
    example: '우리 모임',
  })
  name: string;

  @ApiProperty({
    description: '모임 소개',
    example: '정기적으로 만나는 친구들과의 모임입니다',
  })
  description: string;

  @ApiProperty({
    description: '아이콘 코드',
    example: 'ICON_001',
  })
  iconCode: string;

  @ApiProperty({
    description: '모임장 사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  ownerId: string;

  @ApiProperty({
    description: '현재 참여 인원',
    example: 5,
  })
  memberCount: number;

  @ApiProperty({
    description: '최대 참여 인원',
    example: 50,
  })
  maxMembers: number;

  @ApiProperty({
    description: '공개 모임 여부',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '최근 종료된 일정',
    type: () => LastEndedEventResponseDto,
    nullable: true,
  })
  lastEndedEvent: LastEndedEventResponseDto | null;
}

export class GroupListResponseDto {
  @ApiProperty({
    description: '모임 목록',
    type: [GroupListItemResponseDto],
  })
  items: GroupListItemResponseDto[];
}
