import { ApiProperty } from '@nestjs/swagger';

class EventDetailParticipantResponseDto {
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
    description: '네임태그',
    example: '#1234',
  })
  nameTag: string;

  @ApiProperty({
    description: '선호 테마 색상 (hex)',
    example: '#FF5733',
  })
  preferredThemeColor: string;

  @ApiProperty({
    description: '캐릭터 코드',
    example: 'BEAR',
  })
  characterCode: string;

  @ApiProperty({
    description: '참여자 상태 [준비중, 출발, 도착]',
    enum: ['PREPARING', 'DEPARTED', 'ARRIVED'],
    example: 'PREPARING',
  })
  status: string;
}

/**
 * 생성자 정보
 */
class CreatedByResponseDto {
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
    description: '네임태그',
    example: '#1234',
  })
  nameTag: string;

  @ApiProperty({
    description: '선호 테마 색상 (hex)',
    example: '#FF5733',
  })
  preferredThemeColor: string;

  @ApiProperty({
    description: '캐릭터 코드',
    example: 'BEAR',
  })
  characterCode: string;

  @ApiProperty({
    description: '호스트 레벨',
    example: 5,
  })
  level: number;
}

/**
 * Event 상세 조회 Response DTO
 */
export class EventDetailResponseDto {
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
    description: '생성자 정보',
    type: CreatedByResponseDto,
  })
  createdBy: CreatedByResponseDto;

  @ApiProperty({
    description: '일정 제목',
    example: '정기 모임',
  })
  title: string;

  @ApiProperty({
    description: '일정 설명',
    example: '이번 주 정기 모임입니다',
  })
  description: string;

  @ApiProperty({
    description: '일정 시간',
    example: '2026-01-18T13:00:00.000Z',
  })
  eventTime: Date;

  @ApiProperty({
    description: '추적 시작 시간',
    example: '2026-01-18T12:30:00.000Z',
  })
  trackingStartTime: Date;

  @ApiProperty({
    description: '종료 시간',
    example: '2026-01-18T14:00:00.000Z',
  })
  endTime: Date;

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
    description: '위도',
    example: '37.5665213',
    required: true,
    type: String,
  })
  locationLatitude: string;

  @ApiProperty({
    description: '경도',
    example: '126.9783881',
    required: true,
    type: String,
  })
  locationLongitude: string;

  @ApiProperty({
    description: '일정 상태 [모집중, 진행중, 종료, 취소]',
    enum: ['RECRUITING', 'IN_PROGRESS', 'ENDED', 'CANCELLED'],
    example: 'RECRUITING',
  })
  status: string;

  @ApiProperty({
    description: '참여자 체크 완료 여부 (true: 체크 완료, false: 체크 미완료)',
    example: false,
  })
  isParticipantChecked: boolean;

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

  @ApiProperty({
    description: '참여자 목록',
    type: [EventDetailParticipantResponseDto],
    required: false,
  })
  participants: EventDetailParticipantResponseDto[];
}
