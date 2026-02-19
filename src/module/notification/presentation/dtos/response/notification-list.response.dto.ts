import { ApiProperty } from '@nestjs/swagger';

export class NotificationListItemResponseDto {
  @ApiProperty({
    type: String,
    description: '알림 ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: '알림 타입',
    example: 'meeting',
    enum: ['meeting', 'character', 'attendance', 'system'],
  })
  type: string;

  @ApiProperty({
    type: String,
    description: '알림 제목',
    example: '오늘 정기 모임이 있어요!',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: '알림 부제',
    example: '오후 7:00 · 강남역 2번 출구',
  })
  subtitle: string;

  @ApiProperty({
    type: String,
    description: '상대적 시간',
    example: '1h',
  })
  timeAgo: string;

  @ApiProperty({
    type: Boolean,
    description: '읽음 여부',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    type: String,
    description: '연관 엔티티 ID (딥링크용)',
    example: 'meeting-uuid-123',
    nullable: true,
  })
  referenceId: string | null;

  @ApiProperty({
    type: String,
    description: '연관 엔티티 종류',
    example: 'meeting',
    nullable: true,
  })
  referenceType: string | null;

  @ApiProperty({
    type: String,
    description: '생성 시각 (ISO 8601)',
    example: '2026-02-18T13:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    description: '읽음 처리 시각 (ISO 8601)',
    example: null,
    nullable: true,
  })
  readAt: string | null;
}

export class NotificationListResponseDto {
  @ApiProperty({
    description: '알림 목록',
    type: [NotificationListItemResponseDto],
  })
  items: NotificationListItemResponseDto[];

  @ApiProperty({
    type: String,
    description: '다음 페이지 커서',
    example: 'eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hN...',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    type: Boolean,
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;
}
