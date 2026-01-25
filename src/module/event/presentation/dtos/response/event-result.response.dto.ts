import { ApiProperty } from '@nestjs/swagger';

class EventResultItemResponseDto {
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
    description: '이름 태그',
    example: '#1234',
  })
  nameTag: string;

  @ApiProperty({
    description: '캐릭터 코드',
    example: 'CH001',
  })
  characterCode: string;

  @ApiProperty({
    description: '선호 테마 색상',
    example: '#FF5733',
  })
  preferredThemeColor: string;

  @ApiProperty({
    description: '출석 결과',
    enum: ['ARRIVED', 'LATE', 'ABSENT'],
    example: 'ARRIVED',
  })
  result: string;
}

export class EventResultResponseDto {
  @ApiProperty({
    description: '일정 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  eventId: string;

  @ApiProperty({
    description: '모임 ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  groupId: string;

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
    description: '출석 결과 목록',
    type: [EventResultItemResponseDto],
  })
  results: EventResultItemResponseDto[];
}
