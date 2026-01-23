import { ApiProperty } from '@nestjs/swagger';

class GroupDetailMemberResponseDto {
  @ApiProperty({
    description: '모임원 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: '닉네임',
    example: '홍길동',
  })
  nickname: string;

  @ApiProperty({
    description: '네임태그 (#XXXX 형식)',
    example: '#1234',
  })
  nameTag: string;

  @ApiProperty({
    description: '선호 테마 색상 (hex)',
    example: '#FF5733',
  })
  preferredThemeColor: string;

  @ApiProperty({
    description: '현재 사용 캐릭터 코드',
    example: 'CHAR_001',
  })
  characterCode: string;

  @ApiProperty({
    description: '역할',
    enum: ['OWNER', 'MEMBER'],
    example: 'MEMBER',
  })
  role: string;

  @ApiProperty({
    description: '참여 일시',
    example: '2025-01-01T00:00:00.000Z',
  })
  joinedAt: Date;
}

export class GroupDetailResponseDto {
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
    description: '모임원 목록',
    type: [GroupDetailMemberResponseDto],
  })
  members: GroupDetailMemberResponseDto[];
}
