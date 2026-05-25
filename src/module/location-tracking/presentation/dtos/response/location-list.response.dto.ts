import { ApiProperty } from '@nestjs/swagger';

class LocationListItemResponseDto {
  @ApiProperty({
    type: String,
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

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
    description: '위도',
    example: '37.56668000',
    required: false,
    nullable: true,
  })
  latitude: string | null;

  @ApiProperty({
    type: String,
    description: '경도',
    example: '126.97841400',
    required: false,
    nullable: true,
  })
  longitude: string | null;

  @ApiProperty({
    type: Date,
    description: '마지막 위치 업데이트 시간',
    example: '2026-01-17T13:50:30.000Z',
    required: false,
    nullable: true,
  })
  lastUpdatedAt: Date | null;
}

export class LocationListResponseDto {
  @ApiProperty({
    description: '참여자 위치 목록',
    type: [LocationListItemResponseDto],
  })
  items: LocationListItemResponseDto[];

  @ApiProperty({
    description: '클라이언트 폴링 간격 (초)',
    example: 30,
  })
  pollingIntervalSeconds: number;
}
