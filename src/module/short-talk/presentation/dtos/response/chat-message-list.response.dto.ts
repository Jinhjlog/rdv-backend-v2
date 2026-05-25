import { ApiProperty } from '@nestjs/swagger';

class ChatMessageSenderResponseDto {
  @ApiProperty({
    type: String,
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: '닉네임',
    example: '홍길동',
  })
  nickname: string;

  @ApiProperty({
    type: String,
    description: '네임태그',
    example: '#1234',
  })
  nameTag: string;

  @ApiProperty({
    type: String,
    description: '캐릭터 코드',
    example: 'char_001',
  })
  characterCode: string;

  @ApiProperty({
    type: String,
    description: '선호 테마 색상',
    example: '#FF5733',
  })
  preferredThemeColor: string;
}

export class ChatMessageListItemResponseDto {
  @ApiProperty({
    type: String,
    description: '메시지 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: '그룹 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  groupId: string;

  @ApiProperty({
    type: String,
    description: '발신자 ID',
    example: '987fcdeb-51a2-3bc4-d567-890123456789',
  })
  senderId: string;

  @ApiProperty({
    type: String,
    description: '메시지 내용',
    example: '안녕하세요! 오늘 모임 장소 어디에요?',
  })
  content: string;

  @ApiProperty({
    type: Date,
    description: '전송 일시',
    example: '2026-01-17T10:05:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '발신자 정보',
    type: ChatMessageSenderResponseDto,
  })
  sender: ChatMessageSenderResponseDto;
}

export class ChatMessageListResponseDto {
  @ApiProperty({
    description: '메시지 목록',
    type: [ChatMessageListItemResponseDto],
  })
  items: ChatMessageListItemResponseDto[];

  @ApiProperty({
    type: String,
    description: '다음 페이지 커서',
    example:
      'eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTdUMTA6MDU6MDAuMDAwWiJ9',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    type: Boolean,
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasMore: boolean;
}
